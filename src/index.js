import React from 'react'
import ReactDOM from 'react-dom'
import { colors } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import ComingSoon from './components/ComingSoon'
import modalService from './components/modal/modalService'
import AppContainer from './components/AppContainer'
import blockchainHelper from './modules/blockchain'
import { crowdloanHelper } from './modules/blockchain'
import identityHelper from './utils/substrate/identityHelper'
import App from './App'
import { getClient } from './utils/chatClient'

const SERVER_URL = process.env.REACT_APP_MESSAGING_SERVER_URL
const showComingSoon = process.env.REACT_APP_COMING_SOON === 'true'
const appEnv = process.env.REACT_APP_ENV
const nodeEnv = process.env.NODE_ENV
console.log(`${appEnv} in ${nodeEnv} mode`)

const { green, red } = colors
const theme = createTheme(({
    palette: {
        danger: {
            main: red[500]
        },
        dangerDark: {
            main: red[900]
        },
        deeppink: {
            main: '#ff1493',
        },
        success: {
            main: green[500],
        },
    }
}))

ReactDOM.render(
    (
        <ThemeProvider theme={theme}>
            <AppContainer>
                {showComingSoon
                    ? <ComingSoon />
                    : <App />}
            </AppContainer>
        </ThemeProvider>
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
            chatClient: getClient(SERVER_URL),
            convert: require('./utils/convert'),
            DataStorage: require('./utils/DataStorage').default,
            naclHelper: require('./utils/naclHelper'),
            number: require('./utils/number'),
            PromisE: require('./utils/PromisE').default,
            storage: require('./utils/storageHelper').default,
            utils: require('./utils/utils'),
            validator: require('./utils/validator'),
        }
    }

    connectBlockchain()
}