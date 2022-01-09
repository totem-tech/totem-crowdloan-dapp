import React, { useState } from 'react'
import { BehaviorSubject } from "rxjs"
import FormBuilder from "../../components/form/FormBuilder"
import modalService from '../../components/modal/modalService'
import identityHelper from '../../utils/substrate/identityHelper'
import Balance from '../blockchain/Balance'

export default function CrowdloanForm(props) {
    const rxInputs = useState(getRxInputs)[0]
    return (
        <FormBuilder {...{
            rxInputs,
            onSubmit: (_, values) => modalService.confirm({
                content: 'test',
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
    const rxInputs = new BehaviorSubject([
        {
            inlineLabel: true,
            label: 'Select your contribution identity',
            name: inputNames.identity,
            options: [],
            placeholder: 'Select an identity',
            rxOptions: identityHelper.rxIdentities,
            rxOptionsModifier: identities => {
                identities = Array.from(identities)
                const options = identities
                    .map(([address, { name }]) => ({
                        key: address,
                        text: (
                            <div style={{ width: '100%' }}>
                                <div style={{ float: 'left' }}>
                                    {name + ' '}
                                </div>
                                <div style={{ float: 'right' }}>
                                    <Balance {...{
                                        address,
                                        key: address,
                                    }} />
                                </div>
                            </div>
                        ),
                        value: address,
                    }))

                return options
            },
            required: true,
            type: 'select',
        },
        {
            label: 'Amount you contributed',
            name: inputNames.amountContributed,
            placeholder: 'Enter amount of DOT',
            type: 'number',
        },
        {
            label: 'Enter an amount you would like to contribute',
            name: inputNames.amountToContribute,
            placeholder: 'Enter amount of DOT',
            type: 'number',
        },
        {
            label: 'Enter an amount you would like to pledge',
            labelDetails: 'Maximum 10% of your total contribution',
            name: inputNames.amountPledged,
            placeholder: 'Enter amount of DOT',
            type: 'number',
        },
    ])
    return rxInputs
}

window.identityHelper = identityHelper
