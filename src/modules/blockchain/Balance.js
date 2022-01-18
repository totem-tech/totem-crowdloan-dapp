import React, { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material'
import { Error } from '@mui/icons-material'
import { unsubscribe } from '../../utils/reactHelper'
import { isArr } from '../../utils/utils'
import _blockchainHelper, { BlockchainHelper } from './blockchainHelper'

/**
 * @name    Balance
 * @summary React component to display account balance
 * 
 * @param   {Object}            props
 * @param   {String}            props.address   
 * @param   {BlockchainHelper}  props.blockchainHelper (optional)
 */
export default function Balance({ address, blockchainHelper = _blockchainHelper }) {
    address = isArr(address)
        ? address[0]
        : address
    const [balance, loading, error] = useBalance(address, true, blockchainHelper)[0]


    if (error) return <Error color='error' size={18} />
    if (loading) return <CircularProgress color='warning' size={18} />
    return balance
}

/**
 * @name    useBalance
 * @summary React hook to automatiicaly retrieve identity balance(s)
 * 
 * @param   {Array|String}      address          SS58 decoded address
 * @param   {Boolean}           format           (optional) whether to format the balance as string
 *                                               Default: `true`
 * @param   {BlockchainHelper}  blockchainHelper (optional) 
 * 
 * @returns {Array} result  [balance (Array|String), loading, error]
 */
export const useBalance = (address, format = true, blockchainHelper = _blockchainHelper) => {
    const [[balance, loading, error], setBalance] = useState([0, true, null])

    useEffect(() => {
        let mounted = true
        let sub
        const handleResult = result => {
            if (!mounted) return

            const balance = !isArr(result)
                // single result
                ? formatAmount(
                    result.free,
                    format,
                    blockchainHelper,
                )
                // multiple results
                : result.map(x =>
                    formatAmount(
                        x.free,
                        format,
                        blockchainHelper,
                    )
                )
            setBalance([balance, false])
        }
        const fetch = async () => {
            sub = await blockchainHelper
                .getBalance(
                    address,
                    handleResult,
                )
        }
        if (address) fetch().catch(err =>
            setBalance([
                0,
                false,
                `${err}`.replace('Error: ', ''),
            ])
        )
        return () => {
            mounted = false
            unsubscribe(sub)
        }
    }, [address])

    return [[balance, loading, error], setBalance]
}

export const formatAmount = (amount, format = false, blockchainHelper = _blockchainHelper) => {
    const { unit } = blockchainHelper
    const unitAmount = unit.amount
    amount = unitAmount > 1
        ? amount / unitAmount
        : amount

    if (!format) return amount

    const { decimals, name } = unit
    const formatted = `${amount.toFixed(decimals)} ${name}`
    return formatted
}