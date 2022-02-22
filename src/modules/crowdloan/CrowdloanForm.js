import React, { useEffect, useState } from 'react'
import { BehaviorSubject } from "rxjs"
import { Button, CircularProgress, colors, InputAdornment } from '@mui/material'
import FormBuilder from "../../components/form/FormBuilder"
import { findInput, getValues } from '../../components/form/InputCriteriaHint'
import Message, { STATUS } from '../../components/Message'
import modalService from '../../components/modal/modalService'
import { getUser } from '../../utils/chatClient'
import { translated } from '../../utils/languageHelper'
import identityHelper from '../../utils/substrate/identityHelper'
import { arrSort, deferred, isError, isFn, objClean, objCopy, objToUrlParams, textEllipsis } from '../../utils/utils'
import Balance from '../blockchain/Balance'
import enableExtionsion from '../blockchain/enableExtension'
import blockchainHelper from '../blockchain/blockchainHelper'
import getClient from '../messaging'
import { Settings } from '@mui/icons-material'
import { crowdloanHelper } from '../blockchain'
import PromisE from '../../utils/PromisE'
import { makeStyles } from '@mui/styles'

const PLEDGE_PERCENTAGE = 0.1 // 10%
const [texts, textsCap] = translated({
    amtContdLabel: 'amount you already contributed',
    amtPlgLabel: 'amount you would like to pledge',
    amtPlgLabelDetails: 'You can pledge maximum 10% of your crowdloan contribution.',
    amtPlgLabelDetails2: 'learn more',
    amtRewardsLabel: 'estimated rewards',
    amtRewardsLabelDetails: 'learn more about rewards distribution',
    amtToContLabel: 'amount you would like to contribute now',
    amtToContLabelDetails: 'you can always come back and contribute as many times as you like before the end of the crowdloan',
    close: 'close',
    confirm: 'confirm',
    contributed: 'contributed',
    copiedRefLink: 'your referral link has been copied to clipboard',
    copyRefLink: 'copy your referral link',
    enterAnAmount: 'enter an amount',
    errAccount1: 'in order to contribute to the Totem Crowdloan, you must create a Totem account.',
    errAccount2: 'create an account here.',
    errAccount3: 'alternatively, if you already have an existing Totem account backup file, you can restore it.',
    errAccount4: 'restore account',
    errAmtMax: 'please enter an amount smaller or equal to',
    errAmtMin: 'please enter a number greater than',
    errBackup: 'to safeguard your account please click here to download a backup of your Totem account',
    errFetchContribution: 'failed to retrieve previous contributions',
    errPledgeSave: 'failed to store contribution data',
    errSignature: 'signature pre-validation failed',
    errTxFailed: 'transaction failed!',
    fetchingContributions: 'checking existing contributions',
    idLabel: 'select your blockchain identity',
    idPlaceholder: 'select an identity',
    invite1: 'why not invite your friends to Totem?',
    invite2: 'if your friends contribute you both will earn extra tokens.',
    missingParaId: 'missing parachain ID',
    signAndSend: 'sign and send',
    signatureHeader: 'sign message',
    signatureMsg: 'you are about to contribute to Totem crowdloan.',
    signatureMsg2: 'please click continue to approve and generate a signature for this transaction.',
    submit: 'contribute',
    transactionCompleted: 'transaction completed successfully!',
    txSuccessMsg: 'thank you for contributing!',
    txSuccessMsg2: 'you can come back anytime to contribute more.',
    transactionMsg: 'Please click contribute to continue and approve your transaction to contribute to the Totem crowdloan on the Polkadot relay chain. Once transaction is completed your funds will be locked for the duration of the crowdloan (2 years). This action is irreversible. Please do not close window until you see a confirmation message.',
    txInProgress: 'transaction in-progress',
    txStatus: 'transaction status',
}, true)

const logos = {
    polkadot: 'images/polkadot-logo-circle.svg',
    totem: 'images/logos/colour-t-logo.svg',
}
const useStyles = makeStyles(() => ({
    contributed: {
        fontSize: 11,
        position: 'absolute',
        bottom: -3,
        fontWeight: 'bold',
        right: 16,
        color: 'deeppink',
    },
    link: {
        color: 'orange',
        '&:active': {
            color: 'orange',
            fontWeight: 'bold',
        },
    },
    root: {
        background: 'white',
        borderRadius: 5,
        boxShadow: '7px 7px #f0f0f04f',
        padding: 25,
    },
    subtitle: {
        color: 'deeppink',
        margin: 0,
        lineHeight: 1,
    },
    title: {
        borderBottom: '1px solid deeppink',
        color: 'deeppink',
        lineHeight: 1,
        margin: 0,
        paddingBottom: 5,
    },
}))

export const inputNames = {
    amountContributed: 'amountContributed',
    amountPledged: 'amountPledged',
    amountRewards: 'amountRewards',
    amountToContribute: 'amountToContribute',
    identity: 'identity',
}

export default function CrowdloanForm(props) {
    const classes = useStyles()
    const rxInputs = useState(() => getRxInputs(classes))[0]
    const [state, setState] = useState({
        error: {
            status: STATUS.loading,
            text: '',
        },
        showLoader: true,
    })

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
            await getClient()
            const { id } = getUser() || {}
            const redirectTo = window.location.href
            const appUrl = process.env.REACT_APP_TOTEM_APP_URL
            const getUrl = (params = {}) => `${appUrl}?${objToUrlParams(params)}`

            const urlCreate = getUrl({ form: 'registration', redirectTo })
            const urlRestore = getUrl({ form: 'restore', redirectTo })
            // check if user is registered
            let error = !id && {
                status: STATUS.warning,
                text: (
                    <div>
                        {textsCap.errAccount1 + ' '}
                        <a href={urlCreate}>{textsCap.errAccount2}</a>

                        <br />
                        <br />
                        {textsCap.errAccount3 + ' '}
                        <a href={urlRestore}>{textsCap.errAccount4}</a>
                    </div>
                )
            }

            // check if user has created a backup of their account
            if (!error) {
                const all = identityHelper.getAll()
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
                            <a href={backupUrl}>{textsCap.errBackup}</a>
                        </div>
                    )
                }
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

                        !state.error && handleError(enableExtionsion(), null, setState)
                    },
                    'initialize'
                )
            )
    }, [])

    if (state.showLoader) return <center><CircularProgress /></center>
    if (state.error) return <Message {...state.error} />

    return (
        <FormBuilder {...{
            rxInputs,
            onSubmit: handleSubmit(rxInputs, s => setState({ ...s })),
            ...props,
            ...state,
            formProps: {
                className: classes.root,
            },
        }} />
    )
}
CrowdloanForm.defaultProps = {
    submitButton: textsCap.submit
}

/**
 * @name    checkExtenstion
 * @summary Check if extension is enabled and any indentities were injected
 * 
 * @prop    {*} rxInputs    RxJS subject containing array of input definitions
 */
const checkExtenstion = deferred(rxInputs => {
    if (!rxInputs.value) return
    const injected = identityHelper
        .search({ uri: null }, true)
    const identityIn = findInput(inputNames.identity, rxInputs)
    identityIn.message = injected.size > 0
        ? null
        : { // extension is either not installed, not enabled or user rejected to allow access
            status: STATUS.warning,
            text: (
                <div>
                    Could not access PolkadotJS Extension! Please install and enable the browser extension from here:
                    <br />
                    <a href="https://polkadot.js.org/extension/">
                        https://polkadot.js.org/extension/
                    </a>
                    <br />
                    <br />
                    If you have previosly denied access from this site, please follow steps below:
                    <ol>
                        <li>Open the extension</li>
                        <li>
                            Click on
                            <Settings style={{
                                fontSize: 23,
                                padding: 0,
                                margin: '0 0 -7px 0',
                            }} /> the settings icon
                        </li>
                        <li>Click on "Manage Website Access"</li>
                        <li>Enable access for {window.location.host}</li>
                    </ol>
                    Alternatively, you can continue using the DApp with your localy stored Totem identities (<b>not recommended</b>).
                </div>
            ),
        }
    rxInputs.next(rxInputs.value)
}, 300)

/**
 * @name    customError
 * @name    
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
    const calculateRewards = (amtContribution = 0, amtPledge = 0, validReferred, softCapReached, targetCapReached) => {
        let reward = amtContribution * .1
        if (amtPledge > 0) {
            const totalCommitment = amtContribution + amtPledge
            const ratio = amtPledge / amtContribution
            reward = totalCommitment * (1 + ratio) * .1
        }
        return Number(reward.toFixed(2))
    }
    const handleAmtToContChange = (values, inputs) => {
        const amountContributed = values[inputNames.amountContributed] || 0
        const amountToContribute = values[inputNames.amountToContribute] || 0
        const totalContribution = amountContributed + amountToContribute
        const pledgeIn = findInput(inputNames.amountPledged, inputs)
        const disabled = totalContribution <= 0
        pledgeIn.disabled = disabled
        pledgeIn.max = disabled
            ? 0
            : eval((totalContribution * PLEDGE_PERCENTAGE).toFixed(2)) || 0
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
                        const decimals = value > 100 ? 0 : 2
                        value = value.toFixed(decimals)
                        return {
                            label: value,
                            value: Number(value),
                        }
                    }),
                {
                    label: pledgeIn.max,
                    value: Number(
                        pledgeIn.max
                            .toFixed(pledgeIn.max > 100 ? 0 : 2)
                    ),
                },
            ]
        pledgeIn.step = (pledgeIn.max || 0) < 10
            ? pledgeIn.max / 10
            : 1
        pledgeIn.value = pledgeIn.value > pledgeIn.max
            ? pledgeIn.max
            : pledgeIn.value

        pledgeIn.onChange(getValues(inputs), inputs)
        return true
    }
    const handleIdentityChange = (values, inputs) => {
        const identity = values[inputNames.identity]
        const contributedIn = findInput(inputNames.amountContributed, inputs)
        const toContributeIn = findInput(inputNames.amountToContribute, inputs)
        const identityIn = findInput(inputNames.identity, rxInputs.value)
        const pledgeIn = findInput(inputNames.amountPledged, rxInputs.value)
        contributedIn.value = 0
        // contributedIn.hidden = true

        if (!identity) return true

        identityIn.message = {
            icon: true,
            status: STATUS.loading,
            text: textsCap.fetchingContributions,
        }

        crowdloanHelper
            .getUserContributions(identity)
            .then(async (amountContributed) => {
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
                toContributeIn.onChange(
                    getValues(rxInputs.value),
                    rxInputs.value,
                )
                identityIn.message = null
                rxInputs.next([...rxInputs.value])
            })
            .catch(err => {
                identityIn.message = {
                    header: textsCap.errFetchContribution,
                    icon: true,
                    status: STATUS.error,
                    text: `${err}`

                }
                rxInputs.next([...rxInputs.value])
            })
        return true
    }
    const handlePledgeChange = (values, inputs) => {
        const rewardsIn = findInput(inputNames.amountRewards, inputs)
        const contributed = values[inputNames.amountContributed] || 0
        const toContribute = values[inputNames.amountToContribute] || 0
        const pledge = values[inputNames.amountPledged]
        const totalContribution = contributed + toContribute
        rewardsIn.hidden = !(totalContribution >= 5)
        rewardsIn.value = rewardsIn.hidden
            ? 0
            : calculateRewards(
                totalContribution,
                pledge,
                false,
                false,
                false,
            )
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
            content: (
                <div>
                    <h4 className={classes.subtitle}>Contribute to</h4>
                    <h1 className={classes.title}>Totem Crowdloan</h1>
                </div>
            ),
            type: 'html',
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
            hidden: true,
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
            valueLabelDisplay: 'auto',
            label: textsCap.amtPlgLabel,
            labelDetails: (
                <div>
                    {textsCap.amtPlgLabelDetails + ' '}
                    <a
                        className={classes.link}
                        href='https://docs.totemaccounting.com/#/crowdloan/participation?id=what-is-a-pledge' target='_blank'
                    >
                        {textsCap.amtPlgLabelDetails2}
                    </a>
                </div>
            ),
            min: 0,
            name: inputNames.amountPledged,
            onChange: handlePledgeChange,
            type: 'slider',
            value: 0,
            valueLabelFormat: value => Number(value.toFixed(2))
        },
        {
            disabled: true,
            hidden: true, // visible only when total contribution amount is greater than 5
            InputProps: tokenInputProps('Kapex'),
            label: textsCap.amtRewardsLabel,
            labelDetails: (
                <a
                    className={classes.link}
                    href='https://docs.totemaccounting.com/#/crowdloan/crowdloan-details?id=base-calculation'
                    target='_blank'
                >
                    {textsCap.amtRewardsLabelDetails}
                </a>
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
const handleCopyReferralUrl = event => {
    event.preventDefault()

    const { id } = getUser()
    const url = `${window.location.href}?ref=${id}`
    window.navigator.clipboard.writeText(url)
    modalService.confirm({
        closeButton: textsCap.close,
        confirmButton: null,
        content: textsCap.copiedRefLink,
    })
}

/**
 * @name    handleError
 * @summary Catches all errors while executing the given function and shows a modal to display the error message.
 * To display modal title and subtitle use the `customError()` function.
 * 
 * @param   {Function}          func        function to be executed   
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
                modalService.info({
                    content,
                    subtitle: err?.subtitle,
                    title: err?.title,
                }, modalId)
            }
        } finally {
            isFn(onFinally) && onFinally(state, result)
        }
    }
}

const handleSubmit = (rxInputs, setState) => async (_, values) => {
    const client = await getClient()
    const identity = values[inputNames.identity]
    const identityObj = identityHelper.get(identity)
    if (!identityObj) return

    const amountContributed = values[inputNames.amountContributed]
    const amountToContribute = values[inputNames.amountToContribute]
    const sigantureProps = [
        'amountContributed',
        'amountPledged',
        'amountToContribute',
        'identity',
        'totalContribution',
        'userId'
    ]
    const contribution = objClean(
        {
            ...values,
            totalContribution: amountContributed + amountToContribute,
            userId: getUser()?.id,
        },
        sigantureProps,
    )

    const modalId = 'submit'
    const state = { submitDisabled: true }
    let unsubscribe
    setState(state)
    const handleConfirm = async (accepted) => {
        if (!accepted) return

        const signature = await identityHelper
            .signature(identity, contribution)
        // pre-validate
        const valid = await identityHelper
            .signatureVerify(
                contribution,
                signature,
                identity
            )
        if (!valid) throw new Error(textsCap.errSignature)

        // store pledge data with signature to the messaging server
        await client
            .crowdloan({ ...contribution, signature })
            .catch(customError(textsCap.errPledgeSave))

        // get transaction signer from PolkadotJS extension if identity was injected
        const signer = !identityObj.uri && await identityHelper
            .extension
            .getSigner(identity)

        const rxUpdater = new BehaviorSubject({ status: { type: 'Initiating' } })
        unsubscribe = rxUpdater.subscribe(result => {
            state.message = {
                header: textsCap.txInProgress,
                icon: true,
                status: STATUS.loading,
                text: `${textsCap.txStatus}: ${result?.status?.type || ''}`
            }
            setState(state)
        })

        state.loading = true
        setState(state)
        // execute the contribution transaction
        const [blockHash] = await blockchainHelper
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

        const identityIn = findInput(inputNames.identity, rxInputs.value)
        await identityIn.onChange(values, rxInputs.value, {})
        rxInputs.next([...rxInputs.value])
        // transaction was successful
        setTimeout(() => setState({
            message: {
                header: textsCap.transactionCompleted,
                icon: true,
                status: STATUS.success,
                text: (
                    <div>
                        {textsCap.txSuccessMsg} {textsCap.txSuccessMsg2}
                        <br />
                        <br />
                        {textsCap.invite1} {textsCap.invite2}
                        <br />
                        <Button
                            color='success'
                            onClick={handleCopyReferralUrl}
                            variant='outlined'
                        >
                            {textsCap.copyRefLink}
                        </Button>
                    </div>
                )
            }
        }), 500)
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
            setState,
        ),
        title: textsCap.signatureHeader,
    }, modalId)
}

// Identity options modifier
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
                        margin: '-12px 0 -12px -6px',
                        maxWidth: 36,
                        paddingRight: 5,
                    },
                }
                : { // Totem logo
                    src: logos.totem,
                    style: {
                        margin: '-7px -1px -7px -3px',
                        maxWidth: 34,
                        paddingRight: 8,
                    },
                }

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
                        <Balance address={address} />
                        {/* <div className={classes.contributed}>
                            Contributed: {0.00} {blockchainHelper.unit.name}
                        </div> */}
                        <Contributed {...{ address, className: classes.contributed }} />
                    </div>
                </div>
            )

            return {
                key: address,
                text,
                value: address,
            }
        })

    checkExtenstion(rxInputs)
    return options
}

const Contributed = ({ address, className }) => {
    const [value, setValue] = useState()

    useEffect(() => {
        let mounted, unsubscribe

        (async () => {
            unsubscribe = await crowdloanHelper.getUserContributions(
                address,
                undefined,
                undefined,
                undefined,
                setValue,
            ).catch(() => { })
        })()

        return () => {
            mounted = false
            isFn(unsubscribe) && unsubscribe()
        }
    }, [address])
    return !value
        ? ''
        : (
            <div className={className} >
                {textsCap.contributed}: {value} {blockchainHelper.unit.name}
            </div >
        )
}