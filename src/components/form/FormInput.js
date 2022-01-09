import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
    colors,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material'
import { deferred, isFn } from '../../utils/utils'
import { useRxSubject } from '../../utils/reactHelper'
import InputCriteriaHint from './InputCriteriaHint'
import Message from '../Message'
import PasswordField from './PasswordField'
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
        ignoredAttrs = [],
        inlineLabel = false,
        label,
        labelDetails,
        labelId,
        message,
        name,
        onBlur,
        onFocus,
        options = [],
        placeholder,
        readOnly = false,
        required,
        rxOptions,
        rxOptionsModifier = x => x || [],
        style = {},
        type,
        valid,
        validation,
        value,
        variant,
    } = props
    options = useRxSubject(rxOptions || options, rxOptionsModifier)[0]
    style.cursor = disabled
        ? 'no-drop'
        : readOnly
            ? 'pointer'
            : style.cursor
    let inputEl = ''
    const { hideOnBlur } = validation || {}
    const [isFocused, setIsFocused] = useState(false)
    const gotValue = ![null, undefined, '']
        .includes(value)
    const attrs = {
        ...props,
        error: error || (gotValue && valid === false),
        fullWidth,
        id: id || name,
        onBlur: deferred((...args) => {
            setIsFocused(false);
            isFn(onBlur) && onBlur(...args)
        }, 100),
        onFocus: deferred((...args) => {
            setIsFocused(true);
            isFn(onFocus) && onFocus(...args)
        }, 100),
        style,
        variant: variant || 'outlined',
    }

    labelId = labelId || `${id || name}-label`
    attrs.value = attrs.value === undefined
        ? ''
        : attrs.value
    // prevent local properties
    ignoredAttrs.forEach(key => delete attrs[key])
    // if (!inlineLabel) delete attrs.label

    label = !!label && (
        <InputLabel {...{
            id: labelId,
            htmlFor: attrs.id,
            style: {
                fontWeight: 'bold',
                marginBottom: 7,
            },
        }}
        // disableAnimation shrink={true} focused={false}
        >
            {label}
            {required && (
                <sup style={{ color: 'red' }}>
                    *
                </sup>
            )}
            {!!labelDetails && (
                <div style={{
                    fontWeight: 'normal',
                    margin: '-5px 0',
                    paddingTop: 3,
                }}>
                    <small>{labelDetails}</small>
                </div>
            )}
        </InputLabel>
    )
    delete attrs.label

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
            delete attrs.content
            break
        case 'radio':
            Component = Component || RadioGroup
            delete attrs.label
            inputEl = <Component {...attrs} />
            break
        case 'select':
            Component = Component || Select
            attrs.placeholder = attrs.placeholder || 'Select an item'
            inputEl = (
                <>
                    {!attrs.value && (
                        <Typography {...{
                            style: {
                                position: 'absolute',
                                margin: '16px 15px',
                                fontSize: '105%',
                                color: colors.grey[500],
                            },
                        }}>

                            {attrs.placeholder}
                        </Typography>
                    )}
                    <Component {...attrs}>
                        {props.allowDeselect !== false && (
                            <MenuItem {...{
                                style: {
                                    fontWeight: 'bold',
                                    fontStyle: 'italic',
                                },
                                value: '',
                            }}>
                                {attrs.placeholder}
                            </MenuItem>
                        )}
                        {options.map(({ text, value }, i) => (
                            <MenuItem {...{
                                key: value + i,
                                value,
                            }}>
                                {text}
                            </MenuItem>
                        ))}
                    </Component>
                </>
            )
            break
        case 'custom':
        // Password type and all other types accepted by TextField
        default:
            Component = Component
                || type === 'password'
                ? PasswordField
                : TextField

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
                style: {
                    marginBottom: 0,
                    ...message?.style,
                },
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
                position: 'relative',
                ...containerProps?.style,
            }
        }}>
            {label}
            {inputEl}
            {msg}
            {hints}
        </div>
    )
}
FormInput.defaultProps = {
    ignoredAttrs: [
        'allowDeselect',
        'Component',
        'ignoredAttrs',
        'inlineLabel',
        'labelDetails',
        'message',
        'rxOptions',
        'rxOptionsModifier',
        'valid'
    ]
}
FormInput.propTypes = {
    containerStyle: PropTypes.object,
    ignoredAttrs: PropTypes.array,
    inlineLabel: PropTypes.bool,
}