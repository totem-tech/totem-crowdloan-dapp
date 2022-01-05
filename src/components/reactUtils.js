import React from 'react'
import { isObj } from '../utils/utils'

/**
 * @name    toProps
 * @summary extract/generate props object to be supplied to an element
 * 
 * @param   {*} elOrProps 
 * 
 * @returns {Object}
 */
export const toProps = elOrProps => {
    if (!elOrProps) return elOrProps

    const props = React.isValidElement(elOrProps)
        ? elOrProps.props // react element
        : isObj(elOrProps)
            ? elOrProps // plain object
            : {
                children: elOrProps, // assume string or other valid content
            }
    return { ...props }
}