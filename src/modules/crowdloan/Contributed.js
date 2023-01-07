import React, { useEffect, useState } from 'react'
import { isFn } from '../../utils/utils'
import blockchainHelper, { crowdloanHelper } from '../blockchain/'

/**
 * @name    Contributed
 * @summary display amount contributed to crowdloan by address
 * 
 * @param   {Object} props
 * @param   {String} props.address
 */
export default function Contributed({ address, className, prefix, style, suffix }) {
    const [value, setValue] = useState()

    useEffect(() => {
        let mounted = true, unsubscribe

        (async () => {
            unsubscribe = await crowdloanHelper.getUserContributions(
                address,
                undefined,
                undefined,
                undefined,
                value => mounted && setValue(value),
                false,
            ).catch(err => console.error('Failed to retrieve user contributions', err))
        })()

        return () => {
            mounted = false
            isFn(unsubscribe) && unsubscribe()
        }
    }, [address])
    return !value
        ? ''
        : (
            <div {...{ className, style }}>
                {prefix}{value} {blockchainHelper.unit.name}{suffix}
            </div >
        )
}