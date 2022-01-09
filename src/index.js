import React from 'react'
import ReactDOM from 'react-dom'
import connectToMessagingServer from './modules/messaging'
import blockchain from './modules/blockchain'
import App from './App'

console.log(process.env.NODE_ENV)

const ComingSoon = () => (
    <div style={{ textAlign: 'center' }}>
        <br />
        <h1>Totem Crowdloan is coming soon.</h1>
        <h3>Stay tuned!</h3>
        <p>Check out our <a href="https://totem.live">testnet app</a>.</p>
        <p>Join us on <a href="https://discord.gg/Vx7qbgn">Discord</a> and <a href="https://t.me/totemchat">Telegram</a></p>
        <p>For more information visit <a href="https://totemaccounting.com">our website.</a></p>
    </div>
)
ReactDOM.render(
    process.env.REACT_APP_COMING_SOON === 'true'
        ? <ComingSoon />
        : <App />,
    document.getElementById('root'),
)
const connectBlockchain = async () => {
    const { api } = await blockchain.getConnection()
    window.api = api
    window.blockchain = blockchain
    window.queryBlockchain = (func, args = [], multi, print = true) => blockchain.query(
        func,
        args,
        multi,
        print,
    )
}

connectToMessagingServer()
connectBlockchain()

