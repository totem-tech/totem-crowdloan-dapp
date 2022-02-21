import React from 'react'
import ReactDOM from 'react-dom'
import connectToMessagingServer from './modules/messaging'
import blockchainHelper from './modules/blockchain'
import App from './App'
// import { Typography } from '@mui/material'
import { crowdloanHelper } from './modules/blockchain'
import Holding from './components/holding'

console.log(`${process.env.REACT_APP_ENV} in ${process.env.NODE_ENV} mode`)

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100vh',
        backgroundImage: `url(${process.env.PUBLIC_URL + '/images/landing-background.svg'})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },
})
)

const ComingSoon = () => (
    <div className={classes.root}>
        <CssBaseline />
        <Holding />
    </div>
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

