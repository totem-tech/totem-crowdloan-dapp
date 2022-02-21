import React from 'react'
import ReactDOM from 'react-dom'
import connectToMessagingServer from './modules/messaging'
import blockchainHelper from './modules/blockchain'
import App from './App'
// import { Typography } from '@mui/material'
import { crowdloanHelper } from './modules/blockchain'
import ComingSoon from './components/ComingSoon'

console.log(`${process.env.REACT_APP_ENV} in ${process.env.NODE_ENV} mode`)

const showHoldingPage = process.env.REACT_APP_COMING_SOON === 'true'
ReactDOM.render(
    showHoldingPage
        ? <ComingSoon />
        : <App />,
    document.getElementById('root'),
)

if (!showHoldingPage) {
    const connectBlockchain = async () => {
        const { api } = await blockchainHelper.getConnection()
        window.api = api
    }
    window.blockchain = blockchainHelper
    window.crowdloanHelper = crowdloanHelper
    window.queryBlockchain = (func, args = [], multi, print = true) => blockchainHelper.query(
        func,
        args,
        multi,
        print,
    )
    window.utils = {
        convert: require('./utils/convert'),
        naclHelper: require('./utils/naclHelper'),
        number: require('./utils/number'),
        utils: require('./utils/utils')
    }

    connectToMessagingServer()
    connectBlockchain()
}