import React, { useEffect } from 'react'
import CrowdloanForm from './modules/crowdloan/CrowdloanForm'
import ModalsContainer from './components/modal/ModalsContainer'
import modalService from './components/modal/modalService'
import identityHelper from './utils/substrate/identityHelper'
import { subjectAsPromise } from './utils/reactHelper'
import { isNodeJS } from './utils/utils'

const env = process.env.REACT_APP_ENV
if (env !== 'production') {
    window.identityHelper = identityHelper
}
console.log('Env:', env)

export default () => {
    useEffect(() => {
    }, [])
    return (
        <div style={{ maxWidth: 400, margin: '50px auto' }}>
            <CrowdloanForm />

            {/* Global modals */}
            <ModalsContainer rxModals={modalService.rxModals} />
        </div>
    )
}