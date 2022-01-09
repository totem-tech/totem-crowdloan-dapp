import React, { useEffect, useState } from 'react'
import { formatBalance } from '@polkadot/util'
import blockchainHelper from '.'
import { isArr } from '../../utils/utils'
import { CircularProgress } from '@material-ui/core'
import { unsubscribe } from '../../utils/reactHelper'

export const useBalance = (addresses) => {
    const [[balance, loading, error], setBalance] = useState([0, true, null])

    useEffect(() => {
        let mounted = true
        let sub
        const handleResult = result => {
            if (!mounted) return
            const balance = !isArr(result)
                ? formatBalance(result.free, { decimals: 12 })
                : result.map(x => formatBalance(x.free))
            setBalance([balance, false])
        }
        const fetch = async () => {
            sub = await blockchainHelper
                .getBalance(
                    addresses,
                    handleResult,
                )
        }
        if (addresses) fetch()
            .catch(err =>
                setBalance([0, false, `${err}`])
            )
        return () => {
            mounted = false
            unsubscribe(sub)
        }
    }, [addresses])

    return [[balance, loading, error], setBalance]
}

export default function Balance({ address }) {
    const [balance, loading, error] = useBalance(address)[0]

    if (error) return error
    if (loading) return <CircularProgress size={18} />
    return balance
}