import React from 'react'
import CrowdloanForm from './modules/crowdloan/CrowdloanForm'
import ModalsContainer from './components/modal/ModalsContainer'
import modalService from './components/modal/modalService'

export default () => {
    return (
        <div style={{ maxWidth: 400, margin: '50px auto' }}>
            <CrowdloanForm />

            {/* Global modals */}
            <ModalsContainer rxModals={modalService.rxModals} />
        </div>
    )
}