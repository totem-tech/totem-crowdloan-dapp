import React, { useEffect, useState } from 'react'
import { BehaviorSubject } from "rxjs"
import { colors, InputAdornment } from '@mui/material'
import FormBuilder from "../../components/form/FormBuilder"
import { findInput } from '../../components/form/InputCriteriaHint'
import Message, { STATUS } from '../../components/Message'
import modalService from '../../components/modal/modalService'
import { getUser } from '../../utils/chatClient'
import { translated } from '../../utils/languageHelper'
import identityHelper from '../../utils/substrate/identityHelper'
import { arrSort, deferred, objToUrlParams, textEllipsis } from '../../utils/utils'
import Balance from '../blockchain/Balance'
import enableExtionsion from '../blockchain/enableExtension'
import blockchainHelper from '../blockchain/blockchainHelper'
import init from '../messaging'

const PLEDGE_PERCENTAGE = 0.1 // 10%
const [texts, textsCap] = translated({
    amtContdLabel: 'amount you already contributed',
    amtPlgLabel: 'amount you would like to pledge',
    amtPlgLabelDetails: 'you can pledge maximum 10% of your total contribution',
    amtToContLabel: 'amount you would like to contribute now',
    amtToContLabelDetails: 'you can always come back and contribute as many times as you like before the end of the crowdloan',
    enterAnAmount: 'enter an amount',
    errAccount1: 'in order to use the Totem Crowdloan DApp, you must create a Totem.Live account first.',
    errAccount2: 'create an account here.',
    errAccount3: 'alternatively, if you already have an account backup file, you can restore it.',
    errAccount4: 'restore account',
    errAmtMax: 'please enter an amount smaller or equal to',
    errAmtMin: 'please enter a number greater than',
    errBackup: 'Please create a backup of your account.',
    idLabel: 'select your blockchain identity',
    idPlaceholder: 'select an identity',
}, true)

const logos = {
    polkadot: 'images/polkadot-logo-circle.png',
    totem: 'images/logos/button-288-colour.png',
}

export const inputNames = {
    amountContributed: 'amountContributed',
    amountToContribute: 'amountToContribute',
    amountPledge: 'amountPledge',
    identity: 'identity',
}

export default function CrowdloanForm(props) {
    const rxInputs = useState(getRxInputs)[0]
    const [state, setState] = useState({
        error: {
            status: STATUS.loading,
            text: '',
        },
        loading: true,
    })

    useEffect(() => {
        // on load check if user has already registered
        init()
            .then(client => {
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
                            {textsCap.errAccount1 + ''}
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
                    const allBackedUp = all.every(x => !!x['fileBackupTS'])
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
                setState({
                    error,
                    loading: false,
                })
            })
            .catch(console.error)
    }, [])

    if (state.error) return <Message {...state.error} />

    return (
        <FormBuilder {...{
            rxInputs,
            onSubmit: (_, values) => modalService.confirm({
                content: JSON.stringify(values, null, 4),
                // onConfirm: alert(values)
            }, 'test'),
            ...props,
            ...state,
        }} />
    )
}
CrowdloanForm.defaultProps = {
    submitButton: 'Submit!'
}

export const getRxInputs = () => {
    const rxInputs = new BehaviorSubject()
    const handleAmountTCChange = (values, inputs) => {
        const amountContributed = values[inputNames.amountContributed] || 0
        const amountToContribute = values[inputNames.amountToContribute] || 0
        const total = amountContributed + amountToContribute
        const pledgeIn = findInput(inputNames.amountPledge, inputs)
        const disabled = total <= 0
        pledgeIn.disabled = disabled
        pledgeIn.max = disabled
            ? 0
            : eval((total * PLEDGE_PERCENTAGE).toFixed(2)) || 0
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
                        value = eval(value.toFixed(2))
                        return {
                            label: value,
                            value,
                        }
                    }),
                {
                    label: pledgeIn.max,
                    value: pledgeIn.max,
                },
            ]
        pledgeIn.step = (pledgeIn.max || 0) < 10
            ? pledgeIn.max / 10
            : 1
        pledgeIn.value = pledgeIn.value > pledgeIn.max
            ? pledgeIn.max
            : pledgeIn.value
        return true
    }
    const inputs = [
        {
            inlineLabel: true,
            label: textsCap.idLabel,
            labelDetails: '',
            name: inputNames.identity,
            options: [],
            placeholder: textsCap.idPlaceholder,
            rxOptions: identityHelper.rxIdentities,
            rxOptionsModifier: identityOptionsModifier(rxInputs),
            required: true,
            type: 'select',
        },
        {
            hidden: true,
            label: textsCap.amtContdLabel,
            name: inputNames.amountContributed,
            placeholder: textsCap.enterAnAmount,
            type: 'number',
        },
        {
            customMessages: {
                max: textsCap.errAmtMax,
                min: textsCap.errAmtMin,
            },
            InputProps: {
                // Visibility toggle icon/button
                endAdornment: (
                    <InputAdornment position='end'>
                        <b>{blockchainHelper?.unit?.name || 'DOT'}</b>
                    </InputAdornment>
                ),
            },
            label: textsCap.amtToContLabel,
            labelDetails: textsCap.amtToContLabelDetails,
            max: 1000000,
            min: 5,
            name: inputNames.amountToContribute,
            onChange: handleAmountTCChange,
            placeholder: textsCap.enterAnAmount,
            required: true,
            type: 'number',
        },
        {
            disabled: true,
            valueLabelDisplay: 'auto',
            label: textsCap.amtPlgLabel,
            labelDetails: textsCap.amtPlgLabelDetails,
            min: 0,
            name: inputNames.amountPledge,
            type: 'slider',
        },
    ]

    enableExtionsion()
        .catch(console.error)
    rxInputs.next(inputs)
    return rxInputs
}

const handleSumbit = rxInputs => () => {
    // check identity  balance and warn user about existential (if needed)
}

// Identity options modifier
const identityOptionsModifier = rxInputs => identities => {
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
                        margin: '-5px -5px -5px 0',
                        maxWidth: 20,
                        paddingRight: 10,
                    },
                }
                : { // Totem logo
                    src: logos.totem,
                    style: {
                        margin: '-7px -7px -7px -3px',
                        maxWidth: 27,
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
                        <li>Click on the settings (cog icon)</li>
                        <li>Click on "Manage Website Access"</li>
                        <li>Enable access for {window.location.href}</li>
                    </ol>
                    Alternatively, you can continue using the DApp with your localy stored Totem identities (<b>not recommended</b>).
                </div>
            ),
        }
    rxInputs.next(rxInputs.value)
}, 300)