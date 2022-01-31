import React from 'react'
import {
    FormControlLabel,
    Radio,
    RadioGroup as MuiRadioGroup,
} from '@mui/material'

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