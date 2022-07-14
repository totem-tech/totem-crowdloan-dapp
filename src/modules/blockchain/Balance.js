import React, { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material'
import { Error } from '@mui/icons-material'
import { unsubscribe } from '../../utils/reactHelper'
import { isArr, isFn } from '../../utils/utils'
import bcHelper, { BlockchainHelper } from '.'
import { formatBalance } from './formatBalance'

/**
 * @name    Balance
 * @summary React component to display account balance
 * 
 * @param   {Object}            props
 * @param   {String}            props.address   
 * @param   {BlockchainHelper}  props.blockchainHelper (optional)
 */
export default function Balance(props) {
    let {
        address,
        blockchainHelper = bcHelper,
        asString = true,
        prefix,
        suffix,
    } = props
    const [balance, loading, error] = useBalance(
        address,
        asString,
        blockchainHelper,
    )[0]

    if (error) return <Error color='error' size={18} />
    if (loading) return <CircularProgress color='warning' size={18} />

    return <>{prefix}{balance}{suffix}</>
}

/**
 * @name    useBalance
 * @summary React hook to automatiicaly retrieve identity balance(s)
 * 
 * @param   {Array|String}      address          SS58 decoded address
 * @param   {Boolean|String}    asString         (optional) true/false/'shorten'
 *                                               Default: `true`
 * @param   {BlockchainHelper}  blockchainHelper (optional) Default: global blockchainHelper
 * 
 * @returns {Array} result  [balance (Array|String), loading, error]
 */
export const useBalance = (address, asString = true, blockchainHelper = bcHelper) => {
    const [[balance, loading, error], setBalance] = useState([0, true, null])

    useEffect(() => {
        let mounted = true
        let sub
        const handleResult = result => {
            if (!mounted) return

            const balance = !isArr(result)
                // single result
                ? formatBalance(
                    result.free,
                    asString,
                    blockchainHelper,
                )
                // multiple results
                : result.map(x =>
                    formatBalance(
                        x.free,
                        asString,
                        blockchainHelper,
                    )
                )
            setBalance([balance, false, null])
        }
        const fetch = async () => {
            sub = await blockchainHelper
                .getBalance(
                    address,
                    handleResult,
                )
        }
        if (address) fetch().catch(err => {
            setBalance([
                0,
                false,
                `${err}`.replace('Error: ', ''),
            ])
        })
        return () => {
            mounted = false
            unsubscribe(sub)
        }
    }, [address])

    return [[balance, loading, error], setBalance]
}