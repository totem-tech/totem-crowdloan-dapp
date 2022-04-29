import React, { useEffect, useState } from 'react'
import { BehaviorSubject } from 'rxjs'
import { getClient, rxIsConnected } from '../../utils/chatClient'
import { translated } from '../../utils/languageHelper'
import { subjectAsPromise, unsubscribe } from '../../utils/reactHelper'
import CrowdloanHelper from '../../utils/substrate/CrowdloanHelper'
import { deferred, isBool, isValidNumber } from '../../utils/utils'
import blockchainHelper, { crowdloanActive } from '../blockchain/'

const rxPledgeTotal = new BehaviorSubject(0)
const textsCap = translated({
    unexpectedError: 'unexpected error occured:'
}, true)[1]
/**
 * @name    useCrowdloanStatus
 * @summary React hook to get the current status of a parachain
 * 
 * @param   {CrowdloanHelper}   crowdloanHelper 
 * @param   {Number}            softCap         (optional)
 * @param   {Number}            targetCap       (optional)
 * 
 * @returns {Array} {error, loading, status: {active, isValid....}}
 */
export default function useCrowdloanStatus(crowdloanHelper, softCap, targetCap, pledgeCap) {
    const [{ status, loading, error }, setState] = useState({
        loading: true,
    })

    useEffect(() => {
        let mounted = true
        const unsub = {}
        let amountPledged,
            amountRaised,
            currentBlock,
            endBlock,
            hardCap,
            isValid,
            pledgeCapReached,
            status
        const subscribe = async () => {
            unsub.block = await blockchainHelper.getCurrentBlock(block => {
                currentBlock = block
                updateStatus()
            })
            unsub.funds = await crowdloanHelper.getFunds(result => {
                const { cap = 0, end = 0, raised = 0 } = result || {}
                amountRaised = raised
                endBlock = end
                hardCap = cap
                isValid = result !== null && cap > 0 && end > 0
                updateStatus()
            })
            unsub.pledgedTotal = rxPledgeTotal.subscribe(value => {
                value = value || 0
                amountPledged = value
                pledgeCapReached = !!pledgeCap && value >= pledgeCap
                updateStatus()
            })
        }
        const updateStatus = deferred(() => {
            const allReceived = [
                amountPledged,
                amountRaised,
                currentBlock,
                endBlock,
            ].every(isValidNumber)
            // skip if not all values retrieved
            if (!allReceived) return

            const _status = {
                active: crowdloanActive
                    && isValid
                    && currentBlock < endBlock
                    && amountRaised < hardCap,
                amountPledged,
                amountRaised,
                hardCap,
                hardCapReached: isValid
                    && amountRaised >= hardCap,
                isValid,
                pledgeCap,
                pledgeCapReached,
                softCap,
                softCapReached: isValid
                    && isValidNumber(softCap)
                    && amountRaised >= softCap,
                targetCap,
                targetCapReached: isValid
                    && isValidNumber(targetCap)
                    && amountRaised >= targetCap,
            }

            if (JSON.stringify(status) === JSON.stringify(_status)) return

            status = _status
            setState({ status })
        }, 100)
        subscribe()
            .catch(err =>
                mounted
                && setState({
                    error: `${textsCap.unexpectedError} ${err}`.replace('Error: ', ''),
                    loading: false,
                })
            )

        return () => {
            mounted = false
            unsubscribe(unsub)
        }
    }, [crowdloanHelper, softCap])

    return { error, loading, status }
}

subjectAsPromise(rxIsConnected, true)[0]
    .then(() => {
        getClient()
            .onCrowdloanPledgeTotal(value =>
                rxPledgeTotal.next(value)
            )
    })