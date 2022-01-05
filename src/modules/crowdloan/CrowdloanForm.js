import React from 'react'
import { BehaviorSubject } from "rxjs"
import FormBuilder from "../../components/form/FormBuilder"

export default function CrowdloanForm(props) {
    const rxInputs = new BehaviorSubject([
        {
            label: 'some label',
            name: 'test',
            placeholder: 'test input',
            required: true,
            type: 'text',
        },
    ])

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