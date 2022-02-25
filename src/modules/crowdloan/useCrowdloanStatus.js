import React, { useEffect, useState } from 'react'
import { unsubscribe } from '../../utils/reactHelper'
import CrowdloanHelper from '../../utils/substrate/CrowdloanHelper'
import { deferred, isValidNumber } from '../../utils/utils'
import blockchainHelper from '../blockchain/'

export const CROWDLOAN_STATUS = {
    active: 'active',
    ended: 'ended', // auction period ended
    softCapRaised: 'softCapRaised',
    targetCapReached: 'targetCapReached',
    hardCapReached: 'hardCapReached',
}

/**
 * @name    useCrowdloanStatus
 * @summary React hook to get the current status of a parachain
 * 
 * @param   {CrowdloanHelper}   crowdloanHelper 
 * @param   {Number}            softCap         (optional)
 * @param   {Number}            targetCap       (optional)
 * 
 * @returns {Array} [error, status]
 */
export default function useCrowdloanStatus(crowdloanHelper, softCap, targetCap) {
    const [{ status, loading, error }, setState] = useState({
        loading: true,
    })

    useEffect(() => {
        let mounted = true
        const unsub = {}
        let amountRaised, currentBlock, endBlock, hardCap, status
        const subscribe = async () => {
            unsub.block = await blockchainHelper.getCurrentBlock(block => {
                currentBlock = block
                updateStatus()
            })
            unsub.funds = await crowdloanHelper.getFunds(({ cap, end, raised }) => {
                amountRaised = raised
                endBlock = end
                hardCap = cap
                updateStatus()
            })
        }
        const updateStatus = deferred(() => {
            const allReceived = [
                amountRaised,
                currentBlock,
                endBlock,
            ].every(isValidNumber)
            // skip if not all values retrieved
            if (!allReceived) return

            const _status = {
                active: currentBlock < endBlock && amountRaised < hardCap,
                amountRaised,
                hardCap,
                hardCapReached: amountRaised >= hardCap,
                softCap,
                softCapReached: isValidNumber(softCap) && amountRaised >= softCap,
                targetCap,
                targetCapReached: isValidNumber(targetCap) && amountRaised >= targetCap,
            }

            if (!mounted || JSON.stringify(status) === JSON.stringify(_status)) return

            status = _status
            setState({ status })
        }, 100)
        subscribe()
            .catch(err =>
                mounted
                && setState({
                    error: `${err}`
                        .replace('Error: ', ''),
                })
            )

        return () => {
            mounted = false
            unsubscribe(unsub)
        }
    }, [crowdloanHelper, softCap, targetCap])

    return { error, loading, status }
}
