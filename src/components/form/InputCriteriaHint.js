import React from 'react'
import PropTypes from 'prop-types'
import {
    colors,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material'
import { Cancel, CheckCircleSharp } from '@mui/icons-material'
import { isArr, isBool, isFn, isSubjectLike } from '../../utils/utils'
import { TYPES, validate as _validate } from '../../utils/validator'
import { STATUS } from '../Message'

const { green, grey, red } = colors

export const emailCriterias = [
    {
        hideIcon: true,
        text: 'Please enter a valid email address',
        valid: false,
        regex: new RegExp(
            /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,9}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
        ),
    },
]

export const passwordCriterias = [
    {
        regex: new RegExp(/^.{6,64}$/),
        text: 'Between 6-64 characters',
        valid: false,
    },
    {
        regex: new RegExp(/^.*(?=.*[A-Z]).*$/),
        text: 'At least one uppercase letter',
        valid: false,
    },
    {
        regex: new RegExp(/^.*(?=.*[a-z]).*$/),
        text: 'At least one lowercase letter',
        valid: false,
    },
    {
        regex: new RegExp(/^.*(?=.*\d).*$/),
        text: 'At least one number',
        valid: false,
    },
    {
        regex: new RegExp(/^.*(?=.*[\W|_]).*$/),
        text: 'At least one special character',
        valid: false,
    },
]

export const applyCriterias = (criterias, value) => criterias?.map(c => ({
    ...c,
    valid: !!c.regex
        ? c.regex.test(value)
        : c.validate
            ? c.validate(value)
            : c.valid, // assume manually set

}))

/**
 * @name    fillInputs
 * @summary fill inputs with values
 * 
 * @param   {Array}     inputs 
 * @param   {Object}    values 
 * 
 * @returns {Array} inputs
 */
export const fillInputs = (inputs = [], values = []) => {
    inputs.forEach(input => {
        const { inputs: childInputs, name } = input
        if (isArr(childInputs)) return fillInputs(childInputs, values)

        if (!values.hasOwnProperty(name)) return
        input.value = values[name]
    })
    return inputs
}

/**
 * @name    findInputs
 * @summary recursively search for input by name
 * 
 * @param   {String}    name 
 * @param   {Array}     inputs 
 * 
 * @returns {Object} input
 */
export const findInput = (name, inputs = []) => {
    inputs = isSubjectLike(inputs)
        ? inputs.value
        : inputs
    for (let i = 0; i < inputs.length; i++) {
        if (name === inputs[i].name) return inputs[i]

        const children = inputs[i].inputs
        if (!isArr(children)) continue

        const child = findInput(name, children)
        if (child) return child
    }
}

/**
 * @name    getValues
 * @summary extract values from inputs
 * 
 * @param   {Array} inputs 
 * 
 * @returns {Object} values
 */
export const getValues = inputs => inputs
    .reduce((values, input) => {
        const { inputs: childInputs, name, value } = input
        values[name] = isArr(childInputs)
            ? getValues(childInputs)
            : value
        return values
    }, {})

/**
 * @name    handleInputChange
 * 
 * @param   {Function}  setState 
 * @param   {Object}    field 
 * @param   {Array}     field.criterias
 */
export const handleInputChange = (setState, field = {}) => e => {
    const { value = '' } = e?.target || {}
    const criterias = applyCriterias(field.criterias, value)

    setState({
        ...field,
        criterias,
        valid: !criterias || criterias.every(c => c.valid),
        value,
    })
}

/**
 * @name    validateInput
 * 
 * @param   {Object} input 
 * 
 * @returns {Object} input
 */
export const validateInput = (input, inputs = [], values = getValues(inputs)) => {
    input.validation = input.validation || {}
    const {
        type,
        validation,
        value,
    } = input
    validation.criterias = validation.criterias || []
    let {
        criterias,
        type: typeAlt,
        validate,
    } = validation
    const valid = []
    let err

    if (criterias?.length > 0) {
        criterias = applyCriterias(criterias, value)
        input.validation = {
            ...validation,
            criterias,
        }
        valid.push(!criterias?.find(x => !x.valid))
    }
    if (!!TYPES[typeAlt || type]) {
        err = _validate(value, input)
        valid.push(!err)
    }

    if (!err && isFn(validate)) {
        err = validate(input, inputs, values)
        valid.push(!err)
    }
    // validation error message
    validation.message = !isBool(err)
        && !!err
        && {
        status: STATUS.error,
        text: err,
    }

    input.valid = valid.length == 0
        ? undefined
        : valid.every(x => !!x)
    return input
}

/**
 * @name    InputCriteriaHint
 * @summary Display input criteria hints and indicator whether input matches certian criteria
 *
 * @returns {Element}
 */
export default function InputCriteriaHint(props) {
    let { criterias = [], hideOnValid, style, title, value } = props
    const empty = ['', undefined, null].includes(value)
    criterias = criterias.filter(x => !hideOnValid || !empty && !x.valid)

    return (
        criterias.length > 0 && (
            <List style={{ paddingBottom: 0, ...style }}>
                {title}

                {criterias
                    .filter(({ text }) => !!text)
                    .map(({ iconStyle, hideIcon = false, text, valid }, i) => {
                        const IndicatorIcon = valid
                            ? CheckCircleSharp
                            : Cancel
                        const color = empty
                            ? grey
                            : valid
                                ? green[500]
                                : red[500]

                        return (
                            <ListItem {...{
                                key: i,
                                style: { padding: 0 },
                            }}>
                                {!hideIcon && (
                                    <ListItemIcon style={{ minWidth: 25 }}>
                                        <IndicatorIcon {...{
                                            fontSize: 'small',
                                            style: {
                                                color,
                                                // Keep icon aligned at the top in case text overflows to 2nd line
                                                position: 'absolute',
                                                top: 6,
                                                ...iconStyle,
                                            },
                                        }} />
                                    </ListItemIcon>
                                )}
                                <ListItemText style={{ color }}>
                                    {text}
                                </ListItemText>
                            </ListItem>
                        )
                    })}
            </List>
        )
    )
}
InputCriteriaHint.propTypes = {
    criterias: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string,
            valid: PropTypes.bool.isRequired,
        })
    ).isRequired,
    // whether to hide the specific criteria when the value passes this criteria
    hideOnValid: PropTypes.bool,
    // (optional) text to be displayed above all criteria
    title: PropTypes.string,
    // value of the input field
    value: PropTypes.any,
}
InputCriteriaHint.defaultProps = {
    hideOnValid: false,
    title: '',
}
