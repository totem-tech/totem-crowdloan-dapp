import React from 'react'
import Radio from '@material-ui/core/Radio'
import MuiRadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'

export default function RadioGroup(props) {
    const { defaultValue, name, onChange, options = [], value } = props

    return (
        <MuiRadioGroup {...{
            defaultValue,
            name,
            onChange,
            row: true,
            value,
            ...props,
        }}>
            {options.map(option => (
                <FormControlLabel {...{
                    control: <Radio color='primary' />,
                    ...option
                }}
                />
            ))}
        </MuiRadioGroup>
    )
}