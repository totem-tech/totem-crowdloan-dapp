import React from 'react'
import CrowdloanForm from './modules/crowdloan/CrowdloanForm'
import ModalsContainer from './components/modal/ModalsContainer'
import modalService from './components/modal/modalService'

export default () => {
    return (
        <div style={{
            maxWidth: 450,
            margin: 'auto',
            padding: 15
        }}>
            <CrowdloanForm />

            {/* Global modals */}
            <ModalsContainer rxModals={modalService.rxModals} />
        </div>
    )
}