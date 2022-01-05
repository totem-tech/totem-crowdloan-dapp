import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { BehaviorSubject } from 'rxjs'
import Message, { STATUS } from '../Message'
import { Button } from '@material-ui/core'
import FormInput from './FormInput'
import { findInput, getValues, validateInput } from './InputCriteriaHint'
import { isDefined, isFn } from '../../utils/utils'
import { useRxSubject } from '../../utils/reactHelper'
import { toProps } from '../reactUtils'
import modalService from '../modal/modalService'

const attachName = inputs => (inputs || [])
    .map((input, i) => {
        input.name = input.name || `input-${i}`
        // validate inputs whenever rxInputs change is triggered // ToDo: remove redundant manual validations elsewhere
        validateInput(input)
        return input
    })
export default function FormBuilder(props) {
    let {
        closeOnSubmit,
        formProps,
        hiddenInputs = [],
        loading,
        modalId,
        message,
        onChange: formOnChange,
        onSubmit,
        rxInputs,
        rxValues: _rxValues,
        submitButton,
        values: valuesOriginal = {},
    } = props
    const [inputs] = useRxSubject(rxInputs, attachName)
    const [rxValues] = useState(() => _rxValues || new BehaviorSubject(valuesOriginal))
    const [values] = useRxSubject(rxValues, x => x || {})

    const handleInputChange = name => async (event) => {
        const inputs = rxInputs.value
        const input = findInput(name, inputs)
        let { value } = event.target
        const { onChange: inputOnChange } = input
        const triggerChange = (values) => {
            validateInput(input)
            values = values || getValues(inputs)
            // update state
            rxInputs.next([...inputs])
            rxValues.next(values)
        }

        if (value && input.type === 'number') {
            // converts number field's default value type string to number
            value = eval(value) || ''
        }
        input.value = value
        triggerChange()

        let values = getValues(inputs)
        let doTrigger = isFn(inputOnChange) && await inputOnChange(
            values,
            inputs,
            event,
        )

        if (!isFn(formOnChange)) return doTrigger && triggerChange()

        const formValid = inputs.every(x => !checkInput(x))
        doTrigger = await formOnChange(
            formValid,
            doTrigger
                ? getValues(inputs)
                : values,
            inputs,
            name,
        )

        doTrigger && triggerChange()
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (submitDisabled || loading) return
        try {
            const allOk = !loading
                && !submitDisabled
                && !inputs.find(x => checkInput(x))
            isFn(onSubmit) && await onSubmit(
                allOk,
                getValues(inputs),
                inputs,
                event,
            )
            closeOnSubmit && modalId && modalService.delete(modalId)
        } catch (err) {
            console.error(err)
            alert(err.message)
        }
    }

    /**
     * @name    checkInput
     * @summary checks if everything is okay with an input: value is valid, not loading, not hidden....
     * 
     * @param   {Object} input 
     * 
     * @returns {Boolean} true: submit button should be disabled
     */
    const checkInput = input => {
        let { error, hidden, loading, name, required, type, value, valid } = input
        const ignore = hidden
            || ['html', 'group'].includes(type)
            || hiddenInputs.includes(name)
        if (ignore) return
        if (error || loading) return true

        const empty = [undefined, null, ''].includes(value)
        // value must be valid if required or not empty
        return (required || !empty) && !valid
    }

    loading = loading
        || message?.status === STATUS.loading
    // one or more input's value has changed
    const checkValuesChanged = () => inputs
        .find(({ hidden, name }) => {
            if (hidden) return
            const newValue = isDefined(values[name])
                ? values[name]
                : ''
            const oldValue = isDefined(valuesOriginal[name])
                ? valuesOriginal[name]
                : ''
            return newValue !== oldValue
        })

    // disable submit button if one of the following is true:
    // 1. none of the input's value has changed
    // 2. message status or form is "loading" (indicates submit or some input validation is in progress)
    // 3. one or more inputs contains invalid value (based on validation criteria)
    // 4. one or more required inputs does not contain a value
    const submitDisabled = loading
        || !!inputs.find(checkInput)
        || !checkValuesChanged()

    return (
        <div {...{
            autoComplete: 'off',
            className: 'form-builder',
            component: 'form',
            noValidate: true,
            ...formProps,
        }}>
            {inputs
                .filter(({ hidden, name }) => name && !hidden && !hiddenInputs.includes(name))
                .map(input => (
                    <FormInput {...{
                        ...input,
                        key: input.name,
                        onChange: handleInputChange(input.name),
                    }} />
                ))}
            {message && <Message {...message} />}
            {submitButton && (
                <div style={{
                    cursor: loading ? 'progress' : '',
                    padding: '15px 0 10px 0',
                    textAlign: 'right',
                }}>
                    <Button {...{
                        disabled: submitDisabled,
                        variant: 'contained',
                        color: 'primary',
                        style: { margin: '0 0 0 auto' },
                        onClick: handleSubmit,
                        ...toProps(submitButton),
                    }} />
                </div>
            )}
        </div>
    )
}
FormBuilder.defaultProps = {
    submitButton: 'Submit',
}