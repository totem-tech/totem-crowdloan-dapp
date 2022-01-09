import React from 'react'
import { Box, colors, Typography } from '@mui/material';
import { isStr } from '../utils/utils';

export const STATUS = {
    error: 'error',
    info: 'info',
    loading: 'loading',
    success: 'success',
    warning: 'warning',
}
const { green, grey, red, orange, yellow } = colors
export const STATUS_COLOR = {
    error: red,
    info: grey,
    loading: yellow,
    success: green,
    warning: orange,
}
export default function Message({ status, style, text }) {
    const color = STATUS_COLOR[status] || STATUS_COLOR.info
    text = isStr(text)
        ? text.replace('Error: ', '') // remove "Error: " from error messages
        : text
    return !text
        ? ''
        : (
            <Box style={{
                background: color[100],
                borderRadius: 4,
                margin: '10px 0',
                maxWidth: '100%',
                overflowX: 'auto',
                padding: 7,
                whiteSpace: 'auto',
                ...style,
            }}>
                <Typography style={{
                    color: color[900],
                    padding: '7px 15px',
                }}>
                    {text}
                </Typography>
            </Box>
        )
}