import _BlockchainHelper from '../../utils/substrate/BlockchainHelper'
import CrowdloanHelper from '../../utils/substrate/CrowdloanHelper'

export const BlockchainHelper = _BlockchainHelper
export const parachainId = parseInt(process.env.REACT_APP_PARACHAIN_ID) || undefined
export const softCap = parseFloat(process.env.REACT_APP_SOFT_CAP || 0)
export const targetCap = parseFloat(process.env.REACT_APP_TARGET_CAP || 0)
const disconnectDelayMs = parseInt(process.env.REACT_APP_DISCONNECT_DELAY_MS || 1000 * 60 * 15)
const chainTitle = process.env.REACT_APP_CHAIN_TITLE || 'Blockchain Network'
const dappTitle = process.env.REACT_APP_DAPP_TITLE || 'Totem Crowdloan'
const nodeUrls = (process.env.REACT_APP_NODE_URL || '')
    .split(',')
    .filter(Boolean)
const unit = {
    amount: parseInt(process.env.REACT_APP_UNIT_AMOUNT) || 1,
    decimals: parseInt(process.env.REACT_APP_UNIT_DECIMALS) || 2,
    name: process.env.REACT_APP_UNIT_NAME || 'DOT'
}

const blockchainHelper = new _BlockchainHelper(
    nodeUrls,
    chainTitle,
    disconnectDelayMs,
    undefined, // use default keyring 
    {}, // ToDo use translations?
    unit,
)

export const crowdloanHelper = new CrowdloanHelper(blockchainHelper, parachainId, dappTitle)
export default blockchainHelper