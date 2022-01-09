import BlockchainHelper from '../../utils/substrate/BlockchainHelper'

const NODE_URLS = (process.env.REACT_APP_NODE_URL || '').split(',')
const TITLE = process.env.REACT_APP_NODE_TITLE || 'Blockchain Network'
// Delay in milliseconds to disconnect after the disconnect function is invoked
const DISCONNECT_DELAY = parseInt(process.env.REACT_APP_BLOCKCHAIN_DISCONNECT_DELAY_MS || 1000 * 60 * 15) || 0

export default new BlockchainHelper(NODE_URLS, TITLE, DISCONNECT_DELAY)