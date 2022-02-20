import React from 'react'
import ReactDOM from 'react-dom'
import connectToMessagingServer from './modules/messaging'
import blockchainHelper from './modules/blockchain'
import App from './App'
import { Typography } from '@mui/material'
import { crowdloanHelper } from './modules/blockchain'

console.log(`${process.env.REACT_APP_ENV} in ${process.env.NODE_ENV} mode`)

const ComingSoon = () => (
    <Typography style={{ textAlign: 'center' }}>
        <br />
        <h1>Totem Crowdloan is coming soon.</h1>
        <h3>Stay tuned by <a href="https://totem.live/?form=newslettersignup">signing up here</a>.</h3>
        <p>Check out our <a href="https://totem.live">testnet app</a>.</p>
        <p>Join us on <a href="https://discord.gg/Vx7qbgn">Discord</a> and <a href="https://t.me/totemchat">Telegram</a></p>
        <p>For more information visit <a href="https://totemaccounting.com">our website.</a></p>
    </Typography>
)
ReactDOM.render(
    process.env.REACT_APP_COMING_SOON === 'true'
        ? <ComingSoon />
        : <App />,
    document.getElementById('root'),
)
// ToDo: move to crowdloan form
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

