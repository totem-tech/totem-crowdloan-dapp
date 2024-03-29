import React from 'react'
import { useRxSubject } from '../../utils/reactjs'
import SimpleModal from './SimpleModal'

export default function ModalsContainer({ rxModals }) {
    const [modals] = useRxSubject(rxModals, (x = new Map()) => Array.from(x))

    return (
        <div className='modals-container'>
            {modals.map(([id, modalOrProps], i) => (
                <div key={id + i} id={id}>
                    {React.isValidElement(modalOrProps)
                        ? modalOrProps
                        : <SimpleModal {...modalOrProps} />
                    }
                </div>
            ))}
        </div>
    )
}