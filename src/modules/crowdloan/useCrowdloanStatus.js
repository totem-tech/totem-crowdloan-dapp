import React, { useEffect, useState } from 'react'
import { unsubscribe } from '../../utils/reactHelper'
import CrowdloanHelper from '../../utils/substrate/CrowdloanHelper'
import { deferred, isValidNumber } from '../../utils/utils'
import blockchainHelper from '../blockchain/'

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
export default function useCrowdloanStatus(crowdloanHelper, softCap) {
    const [{ status, loading, error }, setState] = useState({
        loading: true,
    })

    useEffect(() => {
        let mounted = true
        const unsub = {}
        let amountRaised, currentBlock, endBlock, hardCap, status, isValid
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
                isValid = cap > 0 && end > 0
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
                active: isValid && currentBlock < endBlock && amountRaised < hardCap,
                amountRaised,
                hardCap,
                hardCapReached: amountRaised >= hardCap,
                isValid,
                softCap,
                softCapReached: isValidNumber(softCap) && amountRaised >= softCap,
            }

            if (!mounted || JSON.stringify(status) === JSON.stringify(_status)) return

            status = _status
            setState({ status })
        }, 100)
        subscribe()
            .catch(err =>
                mounted
                && setState({
                    error: `${err}`.replace('Error: ', ''),
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
