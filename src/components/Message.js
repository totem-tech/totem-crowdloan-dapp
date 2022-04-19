import React from 'react'
import { Box, CircularProgress, colors, Typography } from '@mui/material';
import { isStr } from '../utils/utils';
import { CheckCircle, Error, HeartBroken, Info } from '@mui/icons-material';

const { green, grey, red, orange, yellow } = colors
export const STATUS = {
    error: 'error',
    info: 'info',
    loading: 'loading',
    success: 'success',
    warning: 'warning',
}
export const STATUS_COLOR = {
    error: red,
    info: grey,
    loading: yellow,
    success: green,
    warning: orange,
}
export const iconSize = 48
export const iconStyle = {
    fontSize: iconSize,
    verticalAlign: 'middle',
}
export const STATUS_ICON = {
    error: <HeartBroken color='error' style={iconStyle} />,
    info: <Info color='info' style={iconStyle} />,
    loading: <CircularProgress color='warning' size={iconSize - 10} style={{ marginTop: 5 }} />,
    success: <CheckCircle color='success' style={iconStyle} />,
    warning: <Error color='warning' style={iconStyle} />,
}
/**
 * @name    Message
 * 
 * @param   {Object} props
 * @param   {*}      props.content
 * @param   {*}      props.header
 * @param   {*}      props.icon
 * @param   {*}      props.id
 * @param   {*}      props.status
 * @param   {*}      props.style
 * @param   {*}      props.text
 */
export default function Message({ content, header, icon, id, status, style, text }) {
    status = STATUS[status] || STATUS.info
    const color = STATUS_COLOR[status] || STATUS_COLOR.info
    text = text || content
    text = isStr(text)
        ? text.replace('Error: ', '') // remove "Error: " from error messages
        : text
    icon = icon !== true
        ? icon
        : STATUS_ICON[status]

    return !text && !header
        ? ''
        : (
            <Box {...{
                className: 'message',
                id,
                style: {
                    background: color[100],
                    borderRadius: 4,
                    margin: '10px 0',
                    maxWidth: '100%',
                    minHeight: 60,
                    overflowX: 'auto',
                    padding: 10,
                    whiteSpace: 'auto',
                    ...style,
                },
            }}>
                <Typography {...{
                    component: 'div',
                    style: {
                        color: color[900],
                        display: 'inline-block',
                        marginLeft: !!icon ? 50 : 0,
                        padding: !!header
                            ? '0 0 0 7px'
                            : 7,
                    }
                }}>
                    <div><b>{header || ''}</b></div>
                    {text}
                </Typography>
                {!!icon && (
                    <div style={{
                        left: 10,
                        position: 'absolute',
                        top: 7,
                    }}>
                        {icon}
                    </div>
                )}
            </Box>
        )
}