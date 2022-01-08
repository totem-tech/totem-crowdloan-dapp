import React, { useState } from 'react'
import { BehaviorSubject } from "rxjs"
import FormBuilder from "../../components/form/FormBuilder"
import { useRxSubject } from '../../utils/reactHelper'
import identityHelper from '../../utils/substrate/identityHelper'
import Balance from '../blockchain/Balance'

export default function CrowdloanForm(props) {
    const rxInputs = useState(getRxInputs)[0]
    return (
        <FormBuilder {...{
            rxInputs,
            onSubmit: (_, values) => alert(JSON.stringify(values, null, 4)),
            ...props
        }} />
    )
}
CrowdloanForm.defaultProps = {
    submitButton: 'Hit it!'
}

export const getRxInputs = () => {
    const rxInputs = new BehaviorSubject([
        {
            label: 'Select Your Contribution Identity',
            name: 'identity',
            options: [],
            placeholder: 'test input',
            rxOptions: identityHelper.rxIdentities,
            rxOptionsModifier: identities => {
                identities = Array.from(identities)
                const options = identities
                    .map(([address, { name }]) => ({
                        key: address,
                        text: (
                            <div style={{ width: '100%' }}>
                                <div style={{ float: 'left' }}>
                                    {name}
                                </div>
                                <div style={{ float: 'right' }}>
                                    <Balance {...{ address }} />
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
    ])
    return rxInputs
}

window.identityHelper = identityHelper
