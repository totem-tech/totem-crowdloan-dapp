import React from 'react'
import {
    Box,
    Step,
    StepLabel,
    Stepper,
} from '@mui/material'
import Message, { STATUS } from '../../components/Message'
import { translated } from '../../utils/languageHelper'
import blockchainHelper, { dappTitle } from '../blockchain'
import { shorten } from '../../utils/number'
import useStyles from './useStyles'
import { useRxSubject } from '../../utils/reactHelper'
import { findInput } from '../../components/form/InputCriteriaHint'
import Countdown from '../../components/Countdown'

const [texts, textsCap] = translated({
    amountRaised: 'amount contributed',
    contributeTo: 'contribute to',
    crowdloan: 'crowdloan',
    errCrowdloanEnded: 'crowdloan has ended',
    errCrowdloanEndedDetails: 'you can no longer make new contributions',
    errCrowdloanInvalid: 'crowdloan is coming soon',
    errCrowdloanInvalidDetails: 'please join our social media channels for announcements',
    bonus: 'bonus',
    pledge: 'pledge',
    pledgeCountDownTitle: 'pledge round ends in',
    stepHardCap: 'hard cap',
    stepStarted: 'started',
    stepSoftCap: 'soft cap',
    stepTargetCap: 'target cap',
}, true)

export const inputNames = {
    amountContributed: 'amountContributed',
    amountPledged: 'amountPledged',
    amountRewards: 'amountRewards',
    amountToContribute: 'amountToContribute',
    crowdloanStatus: 'crowdloanStatus',
    identity: 'identity',
    title: 'title',
}

function CrowdloanStatusSteps({ status }) {
    const classes = useStyles()
    if (!status) return ''

    const {
        active,
        amountRaised,
        hardCap,
        hardCapReached,
        isValid,
        pledgeActive,
        softCap,
        softCapReached,
        targetCap,
        targetCapReached,
    } = status
    const ticker = blockchainHelper.unit.name || 'DOT'
    const bonusStyle = { color: 'deeppink' }
    const capStyle = { fontWeight: 'initial' }
    // const isMobile = checkDevice([DEVICE_TYPE.mobile])

    const steps = [
        {
            completed: true,
            label: textsCap.stepStarted,
        },
        {
            completed: softCapReached,
            label: textsCap.stepSoftCap,
            labelDetails: (
                <div style={capStyle}>
                    {shorten(softCap, 2)} {ticker}
                    <br />
                    <i style={bonusStyle}>10% {texts.bonus}</i>
                </div>
            ),
        },
        targetCap
        && targetCap !== hardCap
        && {
            completed: targetCapReached,
            label: textsCap.stepTargetCap,
            labelDetails: (
                <div style={capStyle}>
                    {shorten(targetCap, 2)} {ticker}
                    <br />
                    <i style={bonusStyle}>20% {texts.bonus}</i>
                </div>
            ),
        },
        {
            completed: hardCapReached,
            label: textsCap.stepHardCap,
            labelDetails: (
                <div style={capStyle}>
                    {shorten(hardCap, 2)} {ticker}
                    <br />
                    <i style={bonusStyle}>20% {texts.bonus}</i>
                </div>
            ),
        },
    ].filter(Boolean)

    const amountRaisedEl = amountRaised > 0 && (
        <div className={classes.amountRaised}>
            <center>
                <strong>
                    {textsCap.amountRaised}: {shorten(amountRaised, 2)} {ticker}
                </strong>
            </center>
        </div>
    )

    return (
        <>
            {!active && (
                <Message {...{
                    header: isValid
                        ? textsCap.errCrowdloanEnded
                        : textsCap.errCrowdloanInvalid,
                    icon: true,
                    status: STATUS.warning,
                    text: !isValid
                        ? textsCap.errCrowdloanInvalidDetails
                        : (
                            <div>
                                {textsCap.errCrowdloanEndedDetails}

                                {amountRaisedEl}
                            </div>
                        ),
                }} />
            )}

            {active && amountRaisedEl}
            {isValid && active && (
                <Stepper alternativeLabel style={{ paddingTop: 15 }}>
                    {steps.map((x, i) => (
                        <Step {...{
                            completed: x.completed,
                            key: i,
                            style: { padding: 0 },
                            title: x.title,
                        }}>
                            <StepLabel StepIconProps={{
                                style: {
                                    color: x.completed && 'deeppink' || '',
                                }
                            }}>
                                {x.label}
                                <div>
                                    <small>
                                        {x.labelDetails}
                                    </small>
                                </div>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            )}
        </>
    )
}

const FormTitle = ({ rxInputs }) => {
    const classes = useStyles()
    const [status = {}] = useRxSubject(
        rxInputs,
        inputs => findInput(
            inputNames.crowdloanStatus,
            inputs,
        )?.value,
    )
    const {
        active,
        pledgeActive,
        pledgeDeadline,
    } = status

    return (
        <Box sx={{ width: '100%' }}>
            <h4 className={classes.subtitle}>
                {textsCap.contributeTo}
            </h4>
            <h1 className={classes.title}>
                {dappTitle} {!pledgeActive ? textsCap.crowdloan : textsCap.pledge}
            </h1>
            {!pledgeActive && <CrowdloanStatusSteps status={status} />}

            {pledgeActive && (
                <Countdown {...{
                    date: pledgeDeadline,
                    title: textsCap.pledgeCountDownTitle,
                }} />
            )}
        </Box>
    )
}
export default React.memo(FormTitle)