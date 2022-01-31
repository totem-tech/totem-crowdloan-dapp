import _BlockchainHelper from '../../utils/substrate/BlockchainHelper'

export const BlockchainHelper = _BlockchainHelper
export default new _BlockchainHelper(
    (process.env.REACT_APP_NODE_URL || '')
        .split(',')
        .filter(Boolean),
    process.env.REACT_APP_NODE_TITLE || 'Blockchain Network',
    parseInt(process.env.REACT_APP_DISCONNECT_DELAY_MS || 1000 * 60 * 15),
    undefined,
    {},
    {
        amount: parseInt(process.env.REACT_APP_UNIT_AMOUNT || '') || undefined,
        decimals: parseInt(process.env.REACT_APP_UNIT_DECIMALS || '2'),
        name: process.env.REACT_APP_UNIT_NAME || 'DOT'
    },
)