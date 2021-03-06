import { translated } from '../../utils/languageHelper'
import _BlockchainHelper from '../../utils/substrate/BlockchainHelper'
import CrowdloanHelper from '../../utils/substrate/CrowdloanHelper'
import { getUrlParam } from '../../utils/utils'

const textsCap = translated({
    blockchainNetwork: 'Blockchain Network',
    dappSubtitle: 'Crowdloan DApp',
    unnamed: 'unnamed',
}, true)[1]
export const BlockchainHelper = _BlockchainHelper
export const parachainId = parseInt(process.env.REACT_APP_PARACHAIN_ID) || undefined
export const pledgeCap = parseFloat(process.env.PLEDGE_CAP) || 0
export const softCap = parseFloat(process.env.REACT_APP_SOFT_CAP) || 0
export const targetCap = parseFloat(process.env.REACT_APP_TARGET_CAP) || 0
export const pledgeDeadline = new Date(process.env.REACT_APP_PLEDGE_DEADLINE)
export const crowdloanActive = process.env.REACT_APP_CROWDLOAN_ACTIVE !== 'NO'
const chainTitle = process.env.REACT_APP_CHAIN_TITLE || textsCap.blockchainNetwork
export const dappTitle = process.env.REACT_APP_DAPP_TITLE || textsCap.unnamed
export const PLEDGE_IDENTITY = '14K5BeQDAwETVu9c7uRnxixW1DRefrbawD8yima2Mv2nR651'

const nodeUrls = [getUrlParam('node-url', window.location.href)]
    .filter(Boolean)
    .concat(
        ...(process.env.REACT_APP_NODE_URL || '')
            .split(',')
            .filter(Boolean)
    )
const disconnectDelayMs = parseInt(process.env.REACT_APP_NODE_DISCONNECT_DELAY_MS || 1000 * 60 * 15)
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
export const crowdloanHelper = new CrowdloanHelper(
    blockchainHelper,
    parachainId,
    `${dappTitle} ${textsCap.dappSubtitle}`,
)
export default blockchainHelper