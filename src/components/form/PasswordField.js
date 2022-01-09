import React, { useState } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

/**
 * @name    PasswordField
 * @summary Password input field with visibility toggle
 * 
 * @param   {Object} props 
 * 
 * @returns {Element}
 */
export default function PasswordField(props) {
    const [show, setShow] = useState(false)

    return (
        <TextField {...{
            // following properties can be overriden by props
            autoComplete: props.name,
            fullWidth: true,
            label: 'Password',
            margin: 'normal',
            name: 'password',
            variant: 'outlined',
            ...props,
            required: true,
            criterias: undefined,
            valid: undefined,
            validation: undefined,
            // cannot override the following properties
            type: show
                ? 'text'
                : 'password',
            value: props.value || '',
            InputProps: {
                // Visibility toggle icon/button
                endAdornment: (
                    <InputAdornment position='end'>
                        <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => setShow(!show)}
                        >
                            {show ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                ),
            }
        }} />
    )
}