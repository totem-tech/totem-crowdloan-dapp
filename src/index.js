import React from 'react'
import ReactDOM from 'react-dom'
import ComingSoon from './components/ComingSoon'
import modalService from './components/modal/modalService'
import blockchainHelper from './modules/blockchain'
// import { Typography } from '@mui/material'
import { crowdloanHelper } from './modules/blockchain'
import identityHelper from './utils/substrate/identityHelper'
import App from './App'
import AppContainer from './components/AppContainer'

const showComingSoon = process.env.REACT_APP_COMING_SOON === 'true'
const appEnv = process.env.REACT_APP_ENV
const nodeEnv = process.env.NODE_ENV
console.log(`${appEnv} in ${nodeEnv} mode`)


ReactDOM.render(
    (
        <AppContainer>
            {showComingSoon
                ? <ComingSoon />
                : <App />}
        </AppContainer>
    ),
    document.getElementById('root'),
)

if (!showComingSoon) {
    const connectBlockchain = async () => {
        const { api } = await blockchainHelper.getConnection()
            .catch(err => {
                console.log({ err })
                return Promise.reject(err)
            })
        window.api = api
    }
    if (appEnv !== 'production') {
        window.blockchain = blockchainHelper
        window.crowdloanHelper = crowdloanHelper
        window.identityHelper = identityHelper
        window.modalService = modalService
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
            PromisE: require('./utils/PromisE').default,
            utils: require('./utils/utils'),
            validator: require('./utils/validator'),
        }
    }

    connectBlockchain()
}

// utils.PromisE.post(
//     'https://polkadot.api.subscan.io/api/scan/parachain/funds',
//     { row: 1, para_id: 2004 }
// ).then(r => console.log('Raised: ', Number(r.data.funds?.[0]?.raised) * 1e-10))

// crowdloanHelper.getFundsRaisedSubscan('https://polkadot.api.subscan.io', 5007)
//     .then(console.warn)