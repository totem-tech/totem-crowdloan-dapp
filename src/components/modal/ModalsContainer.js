import React from 'react'
import { useRxSubject } from '../../utils/reactHelper'
import SimpleModal from './SimpleModal'

export default function ModalsContainer({ rxModals }) {
    const [modals] = useRxSubject(rxModals, (x = new Map()) => Array.from(x))

    return (
        <div className='modals-container'>
            {modals.map(([id, modalOrProps], i) => (
                <div key={id} id={id}>
                    {React.isValidElement(modalOrProps)
                        ? modalOrProps
                        : <SimpleModal {...modalOrProps} />
                    }
                </div>
            ))}
        </div>
    )
}