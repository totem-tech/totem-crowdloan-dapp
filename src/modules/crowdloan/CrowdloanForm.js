import React, { useState } from 'react'
import { BehaviorSubject } from "rxjs"
import { colors } from '@mui/material'
import FormBuilder from "../../components/form/FormBuilder"
import modalService from '../../components/modal/modalService'
import identityHelper from '../../utils/substrate/identityHelper'
import Balance from '../blockchain/Balance'
import enableExtionsion from '../blockchain/enableExtension'
import { findInput } from '../../components/form/InputCriteriaHint'
import { STATUS } from '../../components/Message'
import { arrSort, deferred, textEllipsis } from '../../utils/utils'

export default function CrowdloanForm(props) {
    const rxInputs = useState(getRxInputs)[0]

    return (
        <FormBuilder {...{
            rxInputs,
            onSubmit: (_, values) => modalService.confirm({
                content: JSON.stringify(values, null, 4),
                // onConfirm: alert(values)
            }, 'test'),
            ...props
        }} />
    )
}
CrowdloanForm.defaultProps = {
    submitButton: 'Submit!'
}

export const inputNames = {
    amountContributed: 'amountContributed',
    amountToContribute: 'amountToContribute',
    amountPledge: 'amountPledge',
    identity: 'identity',
}
export const getRxInputs = () => {
    const rxInputs = new BehaviorSubject()
    const inputs = [
        {
            inlineLabel: true,
            label: 'Select your contribution identity',
            labelDetails: '',
            name: inputNames.identity,
            options: [],
            placeholder: 'Select an identity',
            rxOptions: identityHelper.rxIdentities,
            rxOptionsModifier: identityOptionsModifier(rxInputs),
            required: true,
            type: 'select',
        },
        {
            label: 'Amount you contributed',
            name: inputNames.amountContributed,
            placeholder: 'Enter amount of DOT',
            readOnly: true,
            type: 'number',
        },
        {
            label: 'Enter an amount you would like to contribute',
            name: inputNames.amountToContribute,
            placeholder: 'Enter amount of DOT',
            required: true,
            type: 'number',
        },
        {
            label: 'Enter an amount you would like to pledge',
            labelDetails: 'Maximum 10% of your total contribution',
            name: inputNames.amountPledge,
            placeholder: 'Enter amount of DOT',
            type: 'number',
        },
    ]

    enableExtionsion()
        .then(console.log, console.error)
    rxInputs.next(inputs)
    return rxInputs
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
        .map(({ address, name, uri: injected }) => ({
            key: address,
            text: (
                <div style={{ width: '100%' }}>
                    <div style={{ float: 'left' }}>
                        <img {...injected
                            ? { // Polkadot logo
                                src: 'images/polkadot-logo-circle.png',
                                style: {
                                    margin: '-5px -5px -5px 0',
                                    maxWidth: 20,
                                    paddingRight: 10,
                                },
                            }
                            : { // Totem logo
                                src: 'images/logos/button-288-colour.png',
                                style: {
                                    margin: '-7px -7px -7px -3px',
                                    maxWidth: 27,
                                    paddingRight: 8,
                                },
                            }
                        } />
                        {textEllipsis(name, 20, 3, false)}
                    </div>
                    <div style={{
                        color: colors.grey[500],
                        float: 'right',
                    }}>
                        <Balance {...{
                            address,
                            key: address,
                        }} />
                    </div>
                </div>
            ),
            value: address,
        }))

    deferredCheckExtenstion(rxInputs)
    return options
}

// Check if extension is enabled and any indentities were injected
const deferredCheckExtenstion = deferred(rxInputs => {
    if (!rxInputs.value) return
    const injected = identityHelper
        .search({ uri: null }, true)
    const identityIn = findInput(inputNames.identity, rxInputs)
    identityIn.message = injected.size > 0
        ? null
        // extension is either not installed/not enabled or user rejected to allow access
        : {
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
                    Alternatively, you can continue using the DApp with your localy stored Totem identities (not recommended).
                </div>
            ),
        }
    rxInputs.next(rxInputs.value)
}, 300)