import React, { useState } from 'react'
import { ExpandMore, MoreVert, Settings } from '@mui/icons-material'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
} from '@mui/material'
import { findInput } from '../../components/form/InputCriteriaHint'
import { STATUS } from '../../components/Message'
import { checkDevice, DEVICE_TYPE } from '../../utils/checkDevice'
import { translated } from '../../utils/languageHelper'
import identityHelper from '../../utils/substrate/identityHelper'
import { deferred } from '../../utils/utils'
import { inputNames } from './FormTitle'

const [texts, textsCap] = translated({
    alternatively: 'alternatively, you can continue using the DApp with your localy stored Totem identities',
    guidesTitle: 'if you have already installed the extension please try the following instructions:',
    extensionAccessGuide: 'make sure extension is enabled for this site',
    extensionAccessGuide1: 'right click on the PolkadotJS extension icon on the top right side of the browser address bar',
    extensionAccessGuide2: 'click on "This can read and change site data"',
    extensionAccessGuide3: 'click on "On all sites"',
    hostAccessGuide: 'make sure the DApp has access to the extension',
    hostAccessGuide1: 'open the extension',
    hostAccessGuide2: 'click on the settings icon',
    hostAccessGuide3: 'click on "Manage Website Access"',
    hostAccessGuide4: 'enable access for for the following URL:',
    identityAccessGuide: 'make sure that your identity is allowed on any chain',
    identityAccessGuide2: 'click on the options icon next to your desired identity',
    identityAccessGuide3: 'select "Allow use on any chain" from the dropdown list',
    notRecommended: 'not recommended',
    warnMobile: 'PolkadotJS extension is not available on mobile browsers! It is recomended to use a computer browser with PolkadotJS extension enabled.',
    warnSafari1: 'Please note that using Safari browser is not recommended due the lack of a PolkadotJS Extension.',
    warnSafari2: 'Consider using one of the following supported browsers:',
    warnSafari3: 'Chrome, Firefox or any Chromium based browser',
    warnInjectionFailed: 'could not access PolkadotJS Extension! Please install and enable the browser extension from here:',
}, true)

/**
 * @name    checkExtenstion
 * @summary Check if extension is enabled and any indentities were injected
 * 
 * @prop    {*} rxInputs    RxJS subject containing array of input definitions
 */
export const checkExtenstion = deferred((rxInputs, classes) => {
    if (!rxInputs?.value) return

    const injected = identityHelper.extension.checkInjected()
    const identityIn = findInput(inputNames.identity, rxInputs.value)
    // PolkadotJS Extension injection was successful
    if (injected) {
        // no need to clear message
        if (identityIn?.message?.injectionError !== 'yes') return
        identityIn.message = undefined
        return rxInputs.next(rxInputs.value)
    }

    const isMobile = checkDevice([
        DEVICE_TYPE.mobile,
        DEVICE_TYPE.tablet,
    ])
    const isSafari = navigator.userAgent.includes('Safari')
        && navigator.vendor.includes('Apple Computer')
    const isChrome = navigator.userAgent.includes('Chrome')
        && navigator.vendor.includes('Google Inc')
    const isFirefox = navigator.userAgent.includes('Firefox')
        && !navigator.vendor
    const isSupported = !isMobile && (isChrome || isFirefox)
    let error
    if (isSafari) {
        error = (
            <div>
                {textsCap.warnSafari1}
                <br />
                <br />
                {textsCap.warnSafari2}
                <br />
                <br />
                <b>{textsCap.warnSafari3}</b>
            </div>
        )
    } else {
        const guides = [
            {
                content: (
                    <OL items={[
                        textsCap.extensionAccessGuide1,
                        <>
                            {textsCap.extensionAccessGuide2 + ' '}
                            (<MoreVert style={{
                                fontSize: 23,
                                padding: 0,
                                margin: '0 0 -7px 0',
                            }} />)
                        </>,
                        textsCap.extensionAccessGuide3,
                    ]} />
                ),
                title: textsCap.extensionAccessGuide,
            },
            {
                content: (
                    <OL items={[
                        textsCap.hostAccessGuide1,
                        <>
                            {textsCap.hostAccessGuide2 + ' '}
                            (<Settings style={{
                                fontSize: 23,
                                padding: 0,
                                margin: '0 0 -7px 0',
                            }} />)
                        </>,
                        textsCap.identityAccessGuide3,
                        <>
                            {textsCap.hostAccessGuide4} <b>{window.location.host}</b>
                        </>,
                    ]} />
                ),
                title: textsCap.hostAccessGuide,
            },
            {
                content: (
                    <OL items={[
                        textsCap.hostAccessGuide1,
                        <>
                            {textsCap.identityAccessGuide2 + ' '}
                            (<MoreVert style={{
                                fontSize: 23,
                                padding: 0,
                                margin: '0 0 -7px 0',
                            }} />)
                        </>,
                        textsCap.identityAccessGuide3,
                    ]} />

                ),
                title: textsCap.identityAccessGuide,
            },
        ]
        error = isMobile
            ? (
                <>
                    {textsCap.warnMobile}
                    <br />
                </>
            )
            : (
                <>
                    {textsCap.warnInjectionFailed}
                    <br />
                    <a
                        className={classes.link}
                        href='https://polkadot.js.org/extension/'
                        target='_blank'
                    >
                        <b>https://polkadot.js.org/extension/</b>
                    </a>
                    <h4>{textsCap.guidesTitle}</h4>

                    <AccordionGroup items={guides} />
                </>
            )
    }
    identityIn.message = !error
        ? undefined
        : {
            injectionError: 'yes',
            status: STATUS.warning,
            text: (
                <div>
                    {error}
                    <br />
                    {textsCap.alternatively} (<b>{textsCap.notRecommended}</b>)
                </div>
            ),
        }
    rxInputs.next(rxInputs.value)
}, 300)

const AccordionGroup = ({ items = [] }) => {
    const [expanded, setExpanded] = useState(() => {
        const index = (items.findIndex(({ expanded }) => !!expanded) || 0)
        return items?.[index]?.title
    })
    return (
        items.map(({ content, title }, i) => {
            const isExpanded = expanded === title
            const TitleWrapper = isExpanded
                ? 'b'
                : 'span'
            return (
                <Accordion {...{
                    expanded: isExpanded,
                    key: title + i,
                    onChange: () => setExpanded(
                        isExpanded
                            ? null
                            : title,
                    ),
                    style: {
                        margin: 0,
                        borderTop: '0.5px solid #8080803d',
                    }
                }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <TitleWrapper>{title}</TitleWrapper>
                    </AccordionSummary>
                    <AccordionDetails>
                        {content}
                    </AccordionDetails>
                </Accordion>
            )
        })
    )
}

const OL = ({ items = [] }) => (
    <ol style={{ margin: '-10px 0 0 0' }}>
        {items.map((item, i) => (
            <li key={i}>
                {item}
            </li>
        ))}
    </ol>
)