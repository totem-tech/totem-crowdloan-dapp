import React, { Component } from 'react'
import { BehaviorSubject } from 'rxjs'
import { v1 } from 'uuid'
import { toProps } from '../reactUtils'
import { isFn, isObj } from '../../utils/utils'
import SimpleModal from './SimpleModal'
import { translated } from '../../utils/languageHelper'

const textsCap = translated({
    cancel: 'cancel',
    close: 'close',
    confirm: 'confirm',
    ruSure: 'are you sure?',
}, true)[1]
/**
 * @name    ModalService
 * @summary modal sevice provides a simple way to add, update and remove modals when used with the ModalsContainer
 * component which uses the SimpleModal component.
 * 
 * The goal is to eliminate the need to manually modal related code inside the individual components and make working 
 * with modals more fun rather a tedius task.
 * 
 * The default exported instance is the global modal service which is used in the App.js.
 * 
 * @example ```javascript
 * // === Create a new modal ===
 * // For a full list of accepted props see SimpleModal component.
 * const modalProps = {
 *       actionButtons: [{
 *          content: 'Click Me!',
 *          onClicked: () => alert('You clicked me!'),
 *       }],
 *       content: 'This is the body/content of the modal. You can use text or any React element here.',
 *       subtitle: 'This is the subtitle that appears underneath the title.',
 *       title: 'This is the title.',
 * }
 * const modalId = modalService.set(modalProps)
 * 
 * // === Update existing modal ===
 * modalProps.title = 'The updated title'
 * modalProps.subittle = 'This is cool!'
 * modalService.set(modalProps, modalId)
 * 
 * // === Remove modal ===
 * modalService.delete(modalId)
 * 
 * 
 * 
 * ```
 */
export class ModalService {
    constructor() {
        this.rxModals = new BehaviorSubject(new Map())
    }

    /**
     * @name confirm
     * @summary 
     * @param   {Object}    confirmProps    all modal props accepted in the `set` function plus the following:
     * @param   {*}         confirmProps.confirmButton  (optional)
     * @param   {Function}  confirmProps.onConfirm (optional) callback triggered when user confirms or cancels/closes
     * @param   {String}    id              (optional) modal ID
     * 
     * @returns {String}    id
     * 
     * @example ```javascript
     * const confirmProps = {
     *     closeButton: 'No',
     *     confirmButton: 'Yes',
     *     content: 'Are you sure? This action is irreversible!',
     *     onConfirm: accepted => console.log({ accepted }),
     *     maxWidth: 'md',
     *     title: 'Delete object',
     * }
     * modalService.confirm(confirmProps)
     * ```
     */
    confirm = (confirmProps, id = v1()) => {
        let {
            actionButtons = [],
            closeButton,
            confirmButton,
            content = textsCap.ruSure,
            onClose,
            onConfirm,
        } = confirmProps
        const closeBtnProps = toProps(closeButton)
        const confirmBtnProps = toProps(confirmButton)
        const doConfirm = accepted => {
            isFn(onConfirm) && onConfirm(accepted)
            this.delete(id)
        }
        closeButton = closeBtnProps !== null && {
            ...closeBtnProps,
            children: closeBtnProps?.children || textsCap.cancel,
            onClick: (...args) => isFn(closeBtnProps?.onClick) && closeBtnProps.onClick(...args),
        }
        confirmButton = confirmBtnProps !== null && {
            ...confirmBtnProps || {},
            children: confirmBtnProps?.children || textsCap.confirm,
            onClick: (...args) => {
                doConfirm(true)
                isFn(confirmBtnProps?.onClick) && confirmBtnProps.onClick(...args)
            },
        }
        return this.show({
            ...confirmProps,
            actionButtons: [
                ...actionButtons,
                confirmButton,
            ].filter(Boolean),
            closeButton,
            content,
            ignoredAttrs: [
                ...SimpleModal.defaultProps.ignoredAttrs || [],
                'onConfirm',
                'confirmButton',
            ],
            open: true,
            onClose: (...args) => {
                doConfirm(false)
                isFn(onClose) && onClose(...args)
            },
        }, id)
    }

    /**
     * @name    delete
     * @summary close/remove modal
     * 
     * @param   {String} id
     */
    delete = id => this.rxModals.value.get(id) && this.show(null, id)

    info = (confirmProps = {}, id) => {
        confirmProps.confirmButton = null
        confirmProps.closeButton = null
        confirmProps.disableEscapeKeyDown ??= false
        return this.confirm(confirmProps, id)
    }

    /**
     * @name    set
     * @summary add or update a modal
     * 
     * @param   {Object|null}   modalProps  custom modal or props to be supplied to the MUI Dialog component
     * @param   {String}        id          (optional) modal ID.
     *                                      Default: random  UUID V1
     * @param   {*}             Component   Default: `SimpleModal`
     * 
     * @returns {String} id 
     */
    show = (modalProps, id = v1(), Component = SimpleModal) => {
        const modals = this.rxModals.value
        if (isObj(modalProps)) {
            const onClose = modalProps?.onClose
            modalProps.onClose = (...args) => {
                this.delete(id)
                isFn(onClose) && onClose(...args)
            }
            const modal = <Component {...modalProps} />
            modals.set(id, modal)
        } else {
            modals.delete(id)
        }

        this.rxModals.next(
            new Map(
                Array.from([
                    ...modals
                ])
            )
        )
        return id
    }

    /**
     * @name    showCompact
     * @summary show a compact modal. Hides the close button and removes content padding.
     * 
     * @param   {Object}    modalProps 
     * @param   {String}    id 
     * @param   {*}         Component 
     * 
     * @returns {String}    id
     */
    showCompact = (modalProps, id, Component) => this.show(
        {
            contentProps: { style: { padding: 0 } },
            closeButton: null,
            ...modalProps,
        },
        id,
        Component
    )
}

const modalService = new ModalService()
export default modalService