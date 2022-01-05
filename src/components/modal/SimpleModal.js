import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@material-ui/core'
import { toProps } from '../reactUtils'
import { isFn, isObj } from '../../utils/utils'

export default function SimpleModal(props) {
    const {
        actionButtons = [],
        closeButton,
        content,
        ignoredProps,
        onClose,
        open: _open,
        prefix,
        subtitle,
        suffix,
        title,
    } = props
    const [open, setOpen] = useState(_open)

    const handleClose = () => {
        setOpen(false)
        isFn(onClose) && onClose()
    }

    // keep an eye on open prop and change accordingly
    useEffect(() => {
        !_open
            ? handleClose()
            : setOpen(_open)
    }, [_open])

    const closeButtonProps = toProps(closeButton)
    if (closeButtonProps) {
        const onClickOriginal = closeButtonProps.onClick
        closeButtonProps.color = ''
        closeButtonProps.onClick = (...args) => {
            handleClose()
            isFn(onClickOriginal) && onClickOriginal(...args)
        }
    }
    // actions buttons
    const actionsBtns = [
        closeButtonProps,
        ...actionButtons || [],
    ]
        .filter(Boolean)
        .map(x => ({
            color: 'primary',
            variant: 'contained',
            ...toProps(x) || {},

        }))
    // body content
    const dialogProps = {
        ...props,
        onClose: handleClose,
        open,
    }
    ignoredProps.forEach(x => dialogProps[x] = '')
    // modal title
    const titleProps = toProps(title)

    return (
        <Dialog {...dialogProps}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            {prefix}
            {titleProps && (
                <DialogTitle {...titleProps}>
                    {titleProps.children}

                    {subtitle && (
                        <div>
                            <small>{subtitle}</small>
                        </div>
                    )}
                </DialogTitle>
            )}
            {content && (
                <DialogContent >
                    <DialogContentText>
                        {content}
                    </DialogContentText>
                </DialogContent>
            )}
            {!!actionsBtns.length && (
                <DialogActions style={{ padding: '15px 20px 25px' }}>
                    {actionsBtns.map(props => <Button {...props} />)}
                </DialogActions>
            )}
            {suffix}
        </Dialog>
    )
}
const actionPropType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object, // any props that are accepted by MUI Button component
    PropTypes.element,
])
SimpleModal.propTypes = {
    // Additional buttons to be displayed on the right side of the close button
    actionButtons: PropTypes.arrayOf(actionPropType),
    // The close button
    closeButton: actionPropType,
    // Modal body content
    content: PropTypes.any,
    // Callback to be triggered when modal is closed
    onClose: PropTypes.func,
    // Show or hide the modal. NB: if falsy, modal component will still be on the virtual DOM.
    // Default: true
    open: PropTypes.any,
    // Content to be displayed before the title. Eg: to add a mobile modal header
    prefix: PropTypes.any,
    // Modal subtitle/subheader displayed underneath the title.
    // A good place to place short explanation or guideline for the user.
    subtitle: PropTypes.any,
    // Content to be displayed after the action and close buttons.
    suffix: PropTypes.any,
    // Modal title/header
    title: PropTypes.any,

    //... any other props accepted by MUI Dialog component
}
SimpleModal.defaultProps = {
    closeButton: 'Close',
    // if `true`, will prevent closing when modal is clicked
    disableBackdropClick: false,
    // if `true`, will close modal when escape button is pressed
    disableEscapeKeyDown: true,
    fullScreen: false,
    fullWidth: false,
    // ignore these attributes to avoid any unexpected errors
    ignoredProps: [
        'actionButtons',
        'closeButton',
        'content',
        'subtitle',
        'subtitle',
        'suffix',
        'title',
    ],
    maxWidth: 'md',
    open: true,
    scroll: 'body',
}