import { formatNumber, shorten } from '../../utils/number'
import bcHelper, { BlockchainHelper } from '.'

/**
 * @name    formatAmount
 * 
 * @param   {Number}            value  
 * @param   {Boolean|String}    asString  (optional) true/false/'shorten'
 * @param   {BlockchainHelper}  blockchainHelper (optional)
 * 
 * @returns {String|Number}
 */
export const formatBalance = (value, asString = false, blockchainHelper = bcHelper) => {
    const { unit } = blockchainHelper
    const unitAmount = unit.amount
    value = unitAmount > 1
        ? value / unitAmount
        : value
    if (!asString) return value

    const { decimals, name } = unit
    const formatter = asString === 'shorten'
        ? shorten
        : formatNumber
    return `${formatter(value, decimals)} ${name}`
}