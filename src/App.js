import React, { useEffect } from 'react'
// import CrowdloanForm from './modules/crowdloan/CrowdloanForm'
import ModalsContainer from './components/modal/ModalsContainer'
import modalService from './components/modal/modalService'
import { enableExtionsion } from './modules/crowdloan/checkExtension'
import PayoutsView from './modules/crowdloan/PayoutsView'

export default () => {

    // enable Polkadot browser wallet extensions
    useEffect(() => enableExtionsion(), [])
    return (
        <div style={{
            maxWidth: 450,
            margin: 'auto',
            padding: 15
        }}>
            {/* <CrowdloanForm /> */}

            {<PayoutsView />}

            {/* Global modals */}
            <ModalsContainer rxModals={modalService.rxModals} />
        </div>
    )
}