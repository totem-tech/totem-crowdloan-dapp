import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
    colors,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    TextField,
    Typography,
} from '@mui/material'
import { deferred, hasValue, isDefined, isFn } from '../../utils/utils'
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
        // inlineLabel = false,
        label,
        labelDetails,
        labelId,
        message,
        name,
        onBlur,
        onChange,
        onFocus,
        options = [],
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
    const gotValue = hasValue(value)
    // Prioritize validation message if input has a value
    message = gotValue && validation?.message || message
    options = useRxSubject(rxOptions || options, rxOptionsModifier)[0]
    style.cursor = disabled
        ? 'no-drop'
        : readOnly
            ? 'pointer'
            : style.cursor
    let inputEl = ''
    const { hideOnBlur } = validation || {}
    const [isFocused, setIsFocused] = useState(false)
    const attrs = {
        ...props,
        error: error || (gotValue && valid === false),
        fullWidth,
        id: id || name,
        onBlur: deferred((...args) => {
            setIsFocused(false);
            isFn(onBlur) && onBlur(...args)
        }, 100),
        onChange: (event) => {
            let { target: { value } = {} } = event
            if (type === 'number') {
                value = value === ''
                    ? '' // prevents setting 0 after clearing the input
                    : Number(value)
                event.target.value = value
            }
            isFn(onChange) && onChange(event, value)
        },
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
    // prevent local properties being passed to input Component
    ignoredAttrs.forEach(key => delete attrs[key])

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
                    color: 'grey',
                    fontWeight: 'normal',
                    lineHeight: 1,
                    margin: '-5px 0 0',
                    paddingTop: 3,
                    whiteSpace: 'pre-wrap',
                }}>
                    <small>{labelDetails}</small>
                </div>
            )}
        </InputLabel>
    )
    delete attrs.label

    switch (type) {
        // ToDo:
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
            Component = Component || imgPathJointLogo
            delete attrs.label
            inputEl = <Component {...attrs} />
            break
        case 'select':
            Component = Component || Select
            attrs.placeholder = attrs.placeholder || 'Select an item'
            // remove top and bottom padding from the dropdown menu 
            attrs.MenuProps = {
                ...attrs.MenuProps,
                MenuListProps: {
                    ...attrs?.MenuProps?.MenuListProps,
                    style: {
                        paddingTop: 0,
                        paddingBottom: 0,
                        ...attrs?.MenuProps?.MenuListProps?.style,
                    }
                }
            }

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
        case 'slider':
            Component = Component || Slider
            attrs.max = isDefined(attrs.max)
                ? attrs.max
                : 100
            attrs.min = isDefined(attrs.min)
                ? attrs.min
                : 0
            attrs.value = attrs.value || 0
            // remove unwanted props
            delete attrs.error
            delete attrs.fullWidth
            inputEl = <Component {...attrs} />
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

    const msg = message
        && (isFocused || !message.hideOnBlur)
        && (
            <Message {...{
                ...message,
                style: {
                    margin: '10px 0 0',
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
        '_data', // a placeholder to store non-input data
        'allowDeselect',
        'Component',
        'customMessages',
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