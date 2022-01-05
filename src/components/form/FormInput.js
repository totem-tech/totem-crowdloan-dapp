import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { InputLabel, MenuItem, Select, TextField } from '@material-ui/core'
import InputCriteriaHint from './InputCriteriaHint'
import Message from '../Message'
import PasswordField from './PasswordField'
import { deferred, isDefined, isFn } from '../../utils/utils'
import RadioGroup from './RadioGroup'

export default function FormInput(props) {
    let {
        containerProps,
        content,
        Component,
        disabled = false,
        error,
        fullWidth = true,
        id,
        label,
        labelDetails,
        message,
        name,
        onBlur,
        onFocus,
        options,
        placeholder,
        readOnly = false,
        required,
        style = {},
        type,
        valid,
        validation,
        value,
        variant,
    } = props
    // 
    style.cursor = disabled
        ? 'no-drop'
        : readOnly
            ? 'pointer'
            : style.cursor
    let inputEl = ''
    const { hideOnBlur } = validation || {}
    const [isFocused, setIsFocused] = useState(false)
    const gotValue = ![null, undefined, ''].includes(value)
    const attrs = {
        ...props,
        error: error || (gotValue && valid === false),
        fullWidth,
        id: id || name,
        labelDetails: undefined,
        message: undefined,
        onBlur: deferred((...args) => {
            setIsFocused(false);
            isFn(onBlur) && onBlur(...args)
        }, 100),
        onFocus: deferred((...args) => {
            setIsFocused(true);
            isFn(onFocus) && onFocus(...args)
        }, 100),
        placeholder: placeholder || label || name,
        style,
        valid: undefined,
        variant: variant || 'outlined',
    }
    attrs.value = attrs.value === undefined
        ? ''
        : attrs.value

    // prevent local properties
    delete attrs.labelDetails

    switch (type) {
        // case 'group':
        //     const { containerProps, inputs = [] } = props
        //     return (
        //         <div {...containerProps}>
        //             {inputs.map(input => <FormInput {...input} />)}
        //         </div>
        //     )
        case 'hidden':
            return ''
        case 'html':
            inputEl = content
            attrs.content = ''
            break
        case 'radio':
            attrs.label = ''
            inputEl = <RadioGroup {...attrs} />
            break
        case 'select':
            Component = Component || Select
            attrs.label = ''
            attrs.options = ''
            inputEl = (
                <Component {...{
                    ...attrs,
                    id: attrs.id + '-id',
                    labelId: attrs.id,
                }}>
                    {options.map(({ text, value }) => (
                        <MenuItem {...{
                            key: value,
                            value,
                        }}>
                            {text}
                        </MenuItem>
                    ))}
                </Component>
            )
            break
        case 'custom':
        // Password type and all other types accepted by TextField
        default:
            Component = Component || (
                type === 'password'
                    ? PasswordField
                    : TextField
            )

            inputEl = (
                <Component {...{
                    ...attrs,
                    label: undefined,
                    style: { margin: 0 },
                }} />
            )
            break
    }

    const msg = !!message?.text
        && (isFocused || !message.hideOnBlur)
        && (
            <Message {...{
                ...message,
                style: { marginBottom: 0 },
            }} />
        )
    const hints = validation
        && (isFocused || hideOnBlur !== true)
        && (
            <InputCriteriaHint {...{
                ...validation,
                key: value,
                value,
            }} />
        )
    return (
        <div {...{
            ...containerProps,
            style: {
                margin: '0 0 15px',
                ...containerProps?.style,
            }
        }}>
            {!!label && (
                <InputLabel {...{
                    htmlFor: attrs.id,
                    style: {
                        fontWeight: 'bold',
                        marginBottom: 7,
                    },
                }}>
                    {label}
                    {required && (
                        <sup style={{ color: 'red' }}>
                            *
                        </sup>
                    )}
                    {!!labelDetails && (
                        <div style={{ fontWeight: 'normal', paddingTop: 3 }}>
                            <small>{labelDetails}</small>
                        </div>
                    )}
                </InputLabel>
            )}
            {inputEl}
            {msg}
            {hints}
        </div>
    )
}

FormInput.propTypes = {
    containerStyle: PropTypes.object,
}