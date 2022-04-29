import React, { useEffect, useState } from 'react'
import { Celebration, ContentCopy, OpenInNew } from '@mui/icons-material'
import {
    Button,
    CircularProgress,
    colors,
    InputAdornment,
} from '@mui/material'
// Components & Utils
import { BehaviorSubject } from 'rxjs'
import FormBuilder from '../../components/form/FormBuilder'
import { findInput, getValues, validateInput } from '../../components/form/InputCriteriaHint'
import Message, { STATUS, STATUS_ICON } from '../../components/Message'
import modalService from '../../components/modal/modalService'
import { getUser } from '../../utils/chatClient'
import { translated } from '../../utils/languageHelper'
import { shorten } from '../../utils/number'
import PromisE from '../../utils/PromisE'
import { useRxSubject } from '../../utils/reactHelper'
import identityHelper from '../../utils/substrate/identityHelper'
import {
    arrSort,
    deferred,
    isError,
    isFn,
    objToUrlParams,
    textEllipsis,
} from '../../utils/utils'
// Modules
import blockchainHelper, { crowdloanHelper, pledgeCap, softCap, targetCap } from '../blockchain/'
import Balance from '../blockchain/Balance'
import getClient from '../messaging/'
import { AccordionGroup, checkExtenstion, enableExtionsion } from './checkExtension'
import Contributed from './Contributed'
import FormTitle from './FormTitle'
import useCrowdloanStatus from './useCrowdloanStatus'
import useStyles from './useStyles'
import FormInput from '../../components/form/FormInput'

const BASE_REWARD = 0.1
const PLEDGE_PERCENTAGE = 1 // 100%
const PLDEGE_REWARD = 0.32
const TOTEM_APP_URL = process.env.REACT_APP_TOTEM_APP_URL
const [texts, textsCap] = translated({
    amtContdLabel: 'amount already contributed',
    amountPledged: 'amount pledged',
    amtPlgCapReachedMsg: 'We have reached the pledge cap. You can continue to make new contributions until hard cap is reached and crowdloan is active. However, you will not be able to update the pledge amount.',
    amtPlgCapReachedTitle: 'pledge cap reached!',
    amtPlgInvalid: 'please enter an amount greater or equal to your previously pledged amount',
    amtPlgLabel: 'amount you would like to pledge',
    amtPlgLabel2: 'amount you pledged',
    amtPlgLabelDetails: 'You can pledge upto a maximum 100% of your crowdloan contribution.',
    amtPlgLabelDetails2: 'Your pledged amount will be requested only after a parachain slot is won.',
    amtPlgLabelDetails3: 'learn more',
    amtPlgResetValue: 'click to reset to previous pledge amount',
    amtRewardsLabel: 'estimated rewards',
    amtRewardsLabelDetails1: 'indicates minimum expected reward excluding any referral and campaign rewards.',
    amtRewardsLabelDetails2: 'learn more about rewards distribution',
    amtToContLabel: 'amount you would like to contribute now',
    amtToContLabelDetails: 'you can always return to contribute as many times as you like before the end of the crowdloan',
    close: 'close',
    confirm: 'confirm',
    connectingBlockchain: 'connecting to blockchain',
    contributed: 'contributed',
    contributeTo: 'contribute to',
    copiedRefLink: 'referral link is copied to the clipboard',
    copyRefLink: 'copy referral link',
    crowdloan: 'crowdloan',
    enterAnAmount: 'enter an amount',
    errAccount1: 'in order to contribute to the Totem KAPEX Parachain Crowdloan, you must create a Totem account.',
    errAccount2: 'create an account here.',
    errAccount3: 'alternatively, if you already have an existing Totem account backup file, you can restore it.',
    errAccount4: 'restore account',
    errAmtMax: 'please enter an amount smaller than, or equal to',
    errAmtMin: 'please enter a number greater than',
    errBackup: 'to safeguard your account please click here to download a backup of your Totem account',
    errBlockchainConnection: 'failed to connect to blockchain',
    errCrowdloanEnded: 'crowdloan has ended',
    errCrowdloanEndedDetails: 'you can no longer make new contributions',
    errFetchContribution: 'failed to retrieve previous contributions',
    errPledgeSave: 'failed to store contribution data',
    errPledgeSaveSubtitle: 'Your contribution was successful. However, the request to store your contribution and pledge data on our database failed! Please check the error message below:',
    errSignature: 'signature pre-validation failed',
    errTxFailed: 'transaction failed',
    fetchingContributions: 'checking existing contributions...',
    idLabel: 'select your blockchain identity',
    idPlaceholder: 'select a blockchain identity',
    invite1: 'why not invite your friends to Totem?',
    invite2: 'if your friends contribute you both will earn extra tokens.',
    missingParaId: 'missing parachain ID',
    signAndSend: 'sign and send',
    signatureHeader: 'sign message',
    signatureMsg: 'you are about to contribute to Totem KAPEX Parachain Crowdloan',
    signatureMsg2: 'please click continue to approve and sign this transaction.',
    signTxMsg: 'please approve to sign the transaction using your extension identity',
    signDataMsg: 'please approve to sign a message using your extension identity',
    submit: 'contribute',
    transactionCompleted: 'transaction completed successfully.',
    txSuccessMsg: 'thank you for contributing!',
    txSuccessMsg2: 'return anytime to contribute more.',
    transactionMsg: 'Please click Contribute to approve your contribution transaction for the Totem KAPEX Parachain Crowdloan on the Polkadot Relay Chain. Once this transaction is completed your funds will be locked for the duration of the crowdloan (96 weeks). This action is irreversible. Please do not close window until you see a transaction confirmation message.',
    txInProgress: 'transaction in-progress',
    txStatus: 'transaction status',
    viewTransaction: 'view transaction'
}, true)

const logos = {
    polkadot: 'images/polkadot-logo-circle.svg',
    totem: 'images/logos/colour-t-logo.svg',
}

export const inputNames = {
    amountContributed: 'amountContributed',
    amountPledged: 'amountPledged',
    amountRewards: 'amountRewards',
    amountToContribute: 'amountToContribute',
    crowdloanStatus: 'crowdloanStatus',
    identity: 'identity',
    title: 'title',
}

export default function CrowdloanForm(props) {
    const classes = useStyles()
    const [state, setState] = useState({
        error: {
            status: STATUS.loading,
            text: '',
        },
        showLoader: true,
    })
    const [rxInputs] = useState(() => getRxInputs(classes))
    const [inputs] = useRxSubject(rxInputs)
    let { error, loading, status = {} } = useCrowdloanStatus(
        crowdloanHelper,
        softCap,
        targetCap,
        pledgeCap,
    )
    const statusIn = findInput(inputNames.crowdloanStatus, inputs) || {}
    const { active, isValid } = statusIn.value || {}
    const initModalId = 'init'

    // useEffect(() => {
    if (!!statusIn.value || !!error) modalService.delete(initModalId)
    // }, [statusIn.value])

    useEffect(() => {
        if (!crowdloanHelper.parachainId) {
            setState({
                error: {
                    status: STATUS.error,
                    text: textsCap.missingParaId,
                },
                showLoader: false,
            })
            return
        }
        const initialize = async () => {
            const { id } = getUser() || {}
            const redirectTo = window.location.href
            const getUrl = (params = {}) => `${TOTEM_APP_URL}?${objToUrlParams(params)}`

            const urlCreate = getUrl({ form: 'registration', redirectTo })
            const urlRestore = getUrl({ form: 'restore', redirectTo })
            // check if user is registered
            let error = !id && {
                status: STATUS.warning,
                text: (
                    <div>
                        {textsCap.errAccount1 + ' '}
                        <a className={classes.link} href={urlCreate}>
                            {textsCap.errAccount2}
                        </a>

                        <br />
                        <br />
                        {textsCap.errAccount3 + ' '}
                        <a href={urlRestore}>{textsCap.errAccount4}</a>
                    </div>
                )
            }

            // check if user has created a backup of their account
            if (!error) {
                const all = identityHelper
                    .getAll()
                    .filter(x => !!x.uri)
                const allBackedUp = all.every(x =>
                    !x.uri // consider extension identities as backed up
                    || !!x.fileBackupTS
                )
                const backupUrl = getUrl({
                    form: 'backup',
                    confirmed: 'yes', // skips confirmation and starts backup file download immediately
                    redirectTo,
                })
                error = !allBackedUp && {
                    status: STATUS.warning,
                    text: (
                        <div>
                            <a className={classes.link} href={backupUrl}>
                                {textsCap.errBackup}
                            </a>
                        </div>
                    )
                }
            }

            if (!error) {
                modalService.showCompact({
                    content: (
                        <Message {...{
                            content: textsCap.connectingBlockchain,
                            icon: true,
                            style: { margin: 0 },
                            status: STATUS.loading,
                        }} />
                    )
                }, initModalId)
                handleError(getClient(), null, initModalId)
                handleError(
                    blockchainHelper
                        .getConnection()
                        .catch(customError(textsCap.errBlockchainConnection)),
                    null,
                    initModalId,
                )
            }

            return {
                error,
                showLoader: false,
            }
        }
        // on load connect to messaging service and check if user has already registered
        PromisE
            .delay(1000)
            .then(
                handleError(
                    initialize,
                    (state, result) => {
                        state = { ...result, ...state }
                        setState(state)

                        if (state.error) return

                        // attempt to enable browser extension(s) and show error message if any
                        handleError(
                            enableExtionsion(),
                            null,
                            setState,
                        )
                    },
                    'initialize',
                )
            )
    }, [])

    useEffect(() => {
        if (!loading && !error) {
            const statusIn = findInput(inputNames.crowdloanStatus, rxInputs.value)
            const pledgeIn = findInput(inputNames.amountPledged, rxInputs.value)
            pledgeIn.disabled = status.pledgeCapReached
            if (status.pledgeCapReached) {
                pledgeIn.message = {
                    content: textsCap.amtPlgCapReachedMsg,
                    header: (
                        <span style={{ color: 'deeppink' }}>
                            {textsCap.amtPlgCapReachedTitle}
                        </span>
                    ),
                    icon: (
                        <Celebration
                            style={{
                                color: 'deeppink',
                                fontSize: 48,
                                verticalAlign: 'middle',
                            }} />
                    ),
                }
            } else {
                pledgeIn.message = status.amountPledged && {
                    content: (
                        <strong style={{ color: 'deeppink' }}>
                            {textsCap.amountPledged}: {shorten(status.amountPledged, 2)} {blockchainHelper.unit.name}
                        </strong>
                    ),
                    style: { margin: 0 },
                }
            }
            // trigger an update on the pledge input which will update the calculated rewards
            pledgeIn?.onChange(
                getValues(rxInputs.value),
                rxInputs.value,
            )
            statusIn.value = status
            if (!status.active) pledgeIn.label = `${textsCap.amtPlgLabel2} (${blockchainHelper.unit.name})`
            rxInputs.next([...rxInputs.value])
        }
    }, [status])

    if (state.showLoader) return <center><CircularProgress /></center>

    error = !!error
        ? {
            status: STATUS.error,
            text: error,
        }
        : state.error
    if (error) return <Message {...error} />

    return (
        <FormBuilder {...{
            ...props,
            ...state,
            buttonBefore: (
                <Button {...{
                    color: 'success',
                    onClick: handleCopyReferralUrl,
                    style: { marginRight: 5 },
                    variant: 'outlined',
                }}>
                    <ContentCopy /> {textsCap.copyRefLink}
                </Button>
            ),
            formProps: {
                className: classes.root,
            },
            hiddenInputs: [
                // show amountToContribute only when crowdloan is active
                !active && inputNames.amountToContribute,
                // show contributed only after crowdloan is finished
                (!isValid || active) && inputNames.amountContributed,
            ].filter(Boolean),
            onSubmit: handleSubmit(rxInputs, s => setState({ ...s })),
            rxInputs,
            // hide submit button when not active
            submitButton: !active
                ? null
                : textsCap.submit,
        }} />
    )
}

/**
 * @name    customError
 * @summary create a custom Error with title and subtitle properties to be used with Modal or Message   
 * 
 * @param {String|*} title 
 * @param {String|*} subtitle 
 * 
 * @returns {Function}  callback function
 */
const customError = (title, subtitle) => error => {
    const err = isError(error)
        ? error
        : new Error(error)
    err.title = title
    err.subtitle = subtitle
    return Promise.reject(err)
}

/**
 * @name    getRxInputs
 * @summary initialize array of inputs to be used with FormBuilder
 *  
 * @returns {BehaviorSubject}   rxInputs
 */
export const getRxInputs = (classes) => {
    const rxInputs = new BehaviorSubject()
    const calculateRewards = (amtContribution = 0, amtPledge = 0, softCapReached, targetCapReached) => {
        let reward = amtContribution * BASE_REWARD + amtPledge * PLDEGE_REWARD
        if (targetCapReached) {
            reward *= 1.2
        } else if (softCapReached) {
            reward *= 1.1
        }
        return Number(reward.toFixed(4))
    }
    const handleAmtToContChange = (values, inputs) => {
        const amountContributed = values[inputNames.amountContributed] || 0
        const amountToContribute = values[inputNames.amountToContribute] || 0
        const status = values[inputNames.crowdloanStatus]
        const totalContribution = amountContributed + amountToContribute
        const pledgeIn = findInput(inputNames.amountPledged, inputs)
        const disabled = totalContribution <= 0
        pledgeIn.disabled = disabled || status?.pledgeCapReached
        pledgeIn.max = disabled
            ? 0
            : totalContribution * PLEDGE_PERCENTAGE
        pledgeIn.max = Number(pledgeIn.max.toFixed(2))
        pledgeIn.min = pledgeIn.min > pledgeIn.max
            ? pledgeIn.max
            : pledgeIn.min

        pledgeIn.marks = !!pledgeIn.max
            && [
                {
                    label: 0,
                    value: 0,
                },
                ...new Array(4)
                    .fill(0)
                    .map((_, i) => {
                        let value = (pledgeIn.max / 5) * (i + 1)
                        const decimals = value > 10 ? 0 : 2
                        value = Number(value.toFixed(decimals))
                        return {
                            label: shorten(value, 2),
                            value,
                        }
                    }),
                {
                    label: shorten(pledgeIn.max, 2),
                    value: pledgeIn.max,
                },
            ]
        pledgeIn.step = pledgeIn.max > 1000
            ? 10
            : pledgeIn.max > 100
                ? 1
                : pledgeIn.max > 10
                    ? 0.1
                    : 0.01
        pledgeIn.value = pledgeIn.value > pledgeIn.max
            ? pledgeIn.max
            : pledgeIn.value

        pledgeIn?.onChange(getValues(inputs), inputs)
        return true
    }
    const deferredPromise = PromisE.deferred()
    const handleIdentityChange = async (values, inputs) => {
        const identity = values[inputNames.identity]
        const contributedIn = findInput(inputNames.amountContributed, inputs)
        const toContributeIn = findInput(inputNames.amountToContribute, inputs)
        const identityIn = findInput(inputNames.identity, rxInputs.value)
        const pledgeIn = findInput(inputNames.amountPledged, rxInputs.value)
        contributedIn.value = 0
        if (!identity) return true

        identityIn.message = {
            icon: true,
            status: STATUS.loading,
            text: textsCap.fetchingContributions,
        }

        try {
            const promise = crowdloanHelper.getUserContributions(identity)
            const amountContributed = await deferredPromise(promise)
            contributedIn.value = amountContributed
            // contributedIn.hidden = amountContributed <= 0

            // fetch existing amount pledged (if any)
            const client = await getClient()
            const { amountPledged = 0 } = amountContributed > 0
                && await client
                    .crowdloan(identity)
                    .catch(() => ({}))
                || {}
            pledgeIn.value = amountPledged
            pledgeIn.valueOld = amountPledged
            toContributeIn.onChange(
                getValues(rxInputs.value),
                rxInputs.value,
            )
            identityIn.message = null
            rxInputs.next([...rxInputs.value])
        } catch (err) {
            identityIn.message = {
                header: textsCap.errFetchContribution,
                icon: true,
                status: STATUS.error,
                text: `${err}`

            }
            rxInputs.next([...rxInputs.value])
        }
        return true
    }
    const handlePledgeChange = (values, inputs, input) => {
        const rewardsIn = findInput(inputNames.amountRewards, inputs)
        const pledgeIn = findInput(inputNames.amountPledged, inputs)
        const contributed = values[inputNames.amountContributed] || 0
        const toContribute = values[inputNames.amountToContribute] || 0
        const {
            softCapReached,
            targetCapReached,
        } = values[inputNames.crowdloanStatus] || {}
        const { value, valueOld } = pledgeIn
        const pledge = values[inputNames.amountPledged]
        const totalContribution = contributed + toContribute
        rewardsIn.hidden = !(totalContribution >= 5)
        rewardsIn.value = rewardsIn.hidden
            ? 0
            : calculateRewards(
                totalContribution,
                pledge,
                softCapReached,
                targetCapReached,
            )
        pledgeIn.color = pledgeIn.value > 0 && pledgeIn.max === pledgeIn.value
            ? 'success'
            : valueOld && valueOld > value
                ? 'danger'
                : undefined
        return true
    }
    const tokenInputProps = (ticker = blockchainHelper?.unit?.name || 'DOT') => ({
        // Visibility toggle icon/button
        endAdornment: (
            <InputAdornment position='end'>
                <b>{ticker}</b>
            </InputAdornment>
        ),
    })
    const inputs = [
        {
            name: 'title',
            content: <FormTitle rxInputs={rxInputs} />,
            type: 'html',
        },
        {
            hidden: true,
            name: inputNames.crowdloanStatus,
            type: 'text',
        },
        {
            inlineLabel: true,
            label: textsCap.idLabel,
            labelDetails: '',
            name: inputNames.identity,
            onChange: handleIdentityChange,
            options: [],
            placeholder: textsCap.idPlaceholder,
            rxOptions: identityHelper.rxIdentities,
            rxOptionsModifier: identityOptionsModifier(rxInputs, classes),
            required: true,
            type: 'select',
        },
        {
            disabled: true,
            // hidden: true,
            InputProps: tokenInputProps(),
            label: textsCap.amtContdLabel,
            name: inputNames.amountContributed,
            placeholder: textsCap.enterAnAmount,
            type: 'number',
            value: 0,
        },
        {
            customMessages: {
                max: textsCap.errAmtMax,
                min: textsCap.errAmtMin,
            },
            InputProps: tokenInputProps(),
            label: textsCap.amtToContLabel,
            labelDetails: textsCap.amtToContLabelDetails,
            max: 1000000,
            min: 5,
            name: inputNames.amountToContribute,
            onChange: handleAmtToContChange,
            placeholder: textsCap.enterAnAmount,
            required: true,
            type: 'number',
        },
        {
            disabled: true,
            ignoredAttrs: [
                ...FormInput.defaultProps.ignoredAttrs,
                'valueOld',
            ],
            label: `${textsCap.amtPlgLabel} (${blockchainHelper.unit.name})`,
            labelDetails: (
                <div>
                    {textsCap.amtPlgLabelDetails} {textsCap.amtPlgLabelDetails2 + ' '}
                    <a
                        className={classes.link}
                        href='https://docs.totemaccounting.com/#/crowdloan/participation?id=what-is-a-pledge' target='_blank'
                    >
                        {textsCap.amtPlgLabelDetails3}
                    </a>
                </div>
            ),
            min: 0,
            name: inputNames.amountPledged,
            onChange: handlePledgeChange,
            type: 'slider',
            value: 0,
            valueLabelDisplay: 'auto',
            valueLabelFormat: value => Number(value.toFixed(2)),
            validation: {
                validate: (pledgeIn, inputs, values) => {
                    const { value, valueOld = 0 } = pledgeIn
                    const invalid = valueOld > 0 && valueOld > value

                    // reset to previous pledged amount
                    const resetValue = e => {
                        e.preventDefault()
                        pledgeIn.value = valueOld
                        const values = getValues(inputs)
                        // force re-validate input
                        validateInput(pledgeIn, inputs, values)
                        handlePledgeChange(values, inputs, pledgeIn)
                        rxInputs.next([...inputs])
                    }
                    return invalid && (
                        <>
                            {textsCap.amtPlgInvalid + ' '}
                            <a {...{
                                className: classes.link,
                                href: '#',
                                onClick: resetValue,
                                title: textsCap.amtPlgResetValue,
                            }}>
                                {valueOld} {blockchainHelper.unit.name}
                            </a>
                        </>
                    )
                }
            }
        },
        {
            disabled: true,
            hidden: true, // visible only when total contribution amount is greater than 5
            InputProps: tokenInputProps('KAPEX'),
            label: textsCap.amtRewardsLabel,
            labelDetails: (
                <>
                    {textsCap.amtRewardsLabelDetails1 + ' '}
                    <a
                        className={classes.link}
                        href='https://docs.totemaccounting.com/#/crowdloan/crowdloan-details?id=base-calculation'
                        target='_blank'
                    >
                        {textsCap.amtRewardsLabelDetails2}
                    </a>
                </>
            ),
            name: inputNames.amountRewards,
            type: 'number',
        },
        // Referral bonus doc: https://docs.totemaccounting.com/#/crowdloan/crowdloan-proposition?id=crowdloan-referral-bonus
    ]

    rxInputs.next(inputs)
    return rxInputs
}

/**
 * @name    handleCopyReferralUrl
 * 
 * @param   {*} event
 */
const handleCopyReferralUrl = (() => {
    const modalId = 'referral-link'
    const handleCloseModal = deferred(() => modalService.delete(modalId), 2000)
    return event => {
        event.preventDefault()

        const { id } = getUser()
        const url = `${TOTEM_APP_URL}?ref=${id}`
        window.navigator.clipboard.writeText(url)
        modalService.showCompact({
            content: (
                <div style={{ padding: 10 }}>
                    <ContentCopy style={{ verticalAlign: 'middle' }} /> {textsCap.copiedRefLink}
                </div>
            ),
        }, modalId)
        handleCloseModal()
    }
})()

/**
 * @name    handleError
 * @summary Catches all errors while executing a callback function and shows a modal to display the error message.
 * To display modal title and subtitle use the `customError()` function.
 * 
 * @param   {Function}          func        function to be executed on callback
 * @param   {Function}          onFinally   (optional)  callback to be executed after execution of `func`
 * @param   {Function|String}   modalId     (optional)  modal ID or setState function
 * 
 * @returns {Function}  callback
 */
const handleError = (func, onFinally, modalId) => {
    let state = {}
    let result
    return async (...args) => {
        try {
            if (!isFn(func)) return
            result = await func(...args)
        } catch (err) {
            const content = err?.message || `${err}`
            const setState = isFn(modalId) && modalId
            if (setState) {
                state.message = {
                    header: err?.title,
                    icon: true,
                    status: STATUS.error,
                    text: content,
                }
                setState({ ...state })
            } else {
                modalService.showCompact({
                    content: (
                        <Message {...{
                            content: (
                                <>
                                    <div>{err?.subtitle && <small>{err?.subtitle}</small>}</div>
                                    {err.message}
                                </>
                            ),
                            header: err?.title,
                            icon: true,
                            status: STATUS.error,
                            style: {
                                margin: 0,
                                maxWidth: 418,
                            },
                        }} />
                    ),
                }, modalId)
            }
        } finally {
            isFn(onFinally) && onFinally(state, result)
        }
    }
}

/**
 * @name    handleSubmit
 * @summary returns form submit handler
 * 
 * @param   {Object}    rxInputs 
 * @param   {Function}  setState 
 * 
 * @returns {Function}  
 */
const handleSubmit = (rxInputs, setState) => async (allOk, values, inputs, event) => {
    const client = await getClient()
    const identity = values[inputNames.identity]
    const identityObj = identityHelper.get(identity)
    if (!identityObj) return

    const amountContributed = values[inputNames.amountContributed]
    const amountToContribute = values[inputNames.amountToContribute]
    const amountPledged = values[inputNames.amountPledged]
    const entry = {
        amountContributed: amountContributed + amountToContribute, // old + new
        amountPledged,
        identity,
        userId: getUser().id,
    }

    const modalId = 'submit'
    const state = { submitDisabled: true }
    let unsubscribe
    setState(state)
    const showMessage = props => modalService.showCompact({
        content: (
            <Message {...{
                style: {
                    margin: 0,
                    maxWidth: 418,
                },
                icon: true,
                ...props,
            }} />
        ),
    }, modalId)

    const handleConfirm = async (accepted) => {
        if (!accepted) return

        // get transaction signer from PolkadotJS extension if identity was injected
        const signer = !identityObj.uri && await identityHelper
            .extension
            .getSigner(identity)

        signer && showMessage({
            status: STATUS.loading,
            text: textsCap.signDataMsg,
        })
        const signature = await identityHelper
            .signature(identity, entry)

        // pre-validate data
        const valid = await identityHelper
            .signatureVerify(
                entry,
                signature,
                identity
            )
        if (!valid) throw new Error(textsCap.errSignature)

        // set form status to loading to prevent re-submission until done
        state.loading = true
        setState(state)

        // keep track of and display transaction status
        const rxUpdater = new BehaviorSubject({ status: { type: 'Initiating' } })
        unsubscribe = rxUpdater.subscribe(result => {
            showMessage({
                header: textsCap.txInProgress,
                icon: true,
                status: STATUS.loading,
                text: `${textsCap.txStatus}: ${result?.status?.type || ''}`
            })
        })

        signer && showMessage({
            status: STATUS.loading,
            text: textsCap.signTxMsg,
        })
        // execute the contribution transaction
        const [blockHash, eventErrors, txResult] = await blockchainHelper
            .signAndSend(
                identity,
                'api.tx.crowdloan.contribute',
                [
                    crowdloanHelper.parachainId,
                    amountToContribute * blockchainHelper.unit.amount,
                    undefined, // required
                ],
                rxUpdater,
                signer
            )
            .catch(customError(textsCap.errTxFailed))

        // store pledge data with signature to the messaging server
        await client
            .crowdloan({
                ...entry,
                blockHash,
                blockIndex: txResult.status.index,
                signature,
            })
            .catch(customError(textsCap.errPledgeSave, textsCap.errPledgeSaveSubtitle))

        // trigger identity onChange to update contributed amount
        const identityIn = findInput(inputNames.identity, rxInputs.value)
        await identityIn.onChange(values, rxInputs.value, {})
        rxInputs.next([...rxInputs.value])

        const explorerUrl = `https://polkadot.js.org/apps/?rpc=${blockchainHelper.nodeUrls[0]}#/explorer/query/${blockHash}`
        // transaction was successful
        // delay to prevent message being overriden by status message
        setTimeout(() => {
            showMessage({
                header: textsCap.transactionCompleted,
                icon: true,
                status: STATUS.success,
                text: (
                    <div>
                        {textsCap.txSuccessMsg} {textsCap.txSuccessMsg2}
                        <br />
                        <Button {...{
                            color: 'success',
                            // Component: 'a',
                            href: explorerUrl,
                            target: '_blank',
                            variant: 'outlined',
                        }}>
                            <OpenInNew /> {textsCap.viewTransaction}
                        </Button>
                        <br />
                        <br />
                        {textsCap.invite1} {textsCap.invite2}
                        <br />
                        <Button {...{
                            color: 'success',
                            onClick: handleCopyReferralUrl,
                            variant: 'outlined',
                        }}>
                            <ContentCopy /> {textsCap.copyRefLink}
                        </Button>
                    </div>
                )
            })
        }, 300)
    }

    modalService.confirm({
        confirmButton: textsCap.signAndSend,
        content: (
            <>
                {textsCap.signatureMsg}
                <br />
                {textsCap.signatureMsg2}
            </>
        ),
        maxWidth: 'xs',
        onConfirm: handleError(
            handleConfirm,
            (state) => {
                isFn(unsubscribe) && unsubscribe()
                unsubscribe = null
                state.submitDisabled = false
                setState(state)
            },
            modalId,
        ),
        title: textsCap.signatureHeader,
    }, modalId)
}


const balances = new Map()
/**
 * @name    identityOptionsModifier
 * @param   {Object} rxInputs 
 * @param   {Object} classes 
 * 
 * @returns {Function}
 */
const identityOptionsModifier = (rxInputs, classes) => identities => {
    identities = Array.from(identities)
    let options = identities
        .map(([address, { name, uri }]) => ({
            address,
            name,
            injected: uri === null,
        }))

    options = arrSort(options, 'name')
        .map(({ address, name, injected }) => {
            const logoProps = injected
                ? { // Polkadot logo
                    src: logos.polkadot,
                    style: {
                        height: 31,
                        margin: '-12px 0 -12px -6px',
                        paddingRight: 5,
                    },
                }
                : { // Totem logo
                    src: logos.totem,
                    style: {
                        height: 26,
                        margin: '-7px -1px -7px -3px',
                        paddingRight: 8,
                    },
                }

            if (!balances.get(address)) balances.set(address, <Balance address={address} />)
            const text = (
                <div style={{ width: '100%' }}>
                    <div style={{ float: 'left' }}>
                        <img {...logoProps} />
                        {textEllipsis(name, 20, 3, false)}
                    </div>
                    <div style={{
                        color: colors.grey[500],
                        float: 'right',
                    }}>
                        {balances.get(address)}
                        <Contributed {...{
                            address,
                            className: classes.contributed,
                            key: address,
                            prefix: `${textsCap.contributed}: `,
                        }} />
                    </div>
                </div>
            )

            return {
                key: address,
                text,
                value: address,
            }
        })

    checkExtenstion(rxInputs, classes)
    return options
}

const showCompactModal = (props, modalId) => modalService.show({
    // content: (
    //     <Message {...{
    //         style: { margin: 0 },
    //         icon: true,
    //         ...msgProps,
    //     }} />
    // ),
    contentProps: { style: { padding: 0 } },
    closeButton: null,
    ...props,
}, modalId)