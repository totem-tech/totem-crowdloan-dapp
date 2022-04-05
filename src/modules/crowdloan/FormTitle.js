import React, { useEffect } from 'react'
import {
    Box,
    CircularProgress,
    Step,
    StepLabel,
    Stepper,
} from '@mui/material'
import Message, { STATUS } from '../../components/Message'
import { translated } from '../../utils/languageHelper'
import { isFn } from '../../utils/utils'
import blockchainHelper, { crowdloanHelper, dappTitle, softCap } from '../blockchain'
import useCrowdloanStatus from './useCrowdloanStatus'
import { shorten } from '../../utils/number'
import useStyles from './useStyles'
import { useRxSubject } from '../../utils/reactHelper'
import { findInput } from '../../components/form/InputCriteriaHint'
import { makeStyles } from '@mui/styles'

const [texts, textsCap] = translated({
    amountRaised: 'amount raised',
    contributeTo: 'contribute to',
    crowdloan: 'crowdloan',
    errCrowdloanEnded: 'crowdloan has ended',
    errCrowdloanEndedDetails: 'you can no longer make new contributions',
    step10PBonus: '10% bonus',
    stepHardCap: 'target cap',
    stepStarted: 'started',
    stepSoftCap: 'soft cap',
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
        softCap,
        softCapReached,
    } = status
    const ticker = blockchainHelper.unit.name || 'DOT'
    const steps = [
        {
            completed: true,
            label: textsCap.stepStarted,
        },
        {
            completed: softCapReached,
            label: textsCap.stepSoftCap,
            labelDetails: (
                <div>
                    {shorten(softCap, 2)} {ticker}
                    <br />
                    <i>+{textsCap.step10PBonus}</i>
                </div>
            ),
        },
        {
            completed: !active,
            label: textsCap.stepHardCap,
            labelDetails: (
                <div>
                    {shorten(hardCap, 2)} {ticker}
                    <br />
                    <i>+{textsCap.step10PBonus}</i>
                </div>
            ),
        },
    ].filter(Boolean)

    return (
        <>
            {!active && (
                <Message {...{
                    header: textsCap.errCrowdloanEnded,
                    icon: true,
                    status: STATUS.warning,
                    text: textsCap.errCrowdloanEndedDetails,
                }} />
            )}

            {amountRaised > 0 && (
                <div className={classes.amountRaised}>
                    <center>
                        <strong>
                            {textsCap.amountRaised}: {shorten(amountRaised, 2)} {ticker}
                        </strong>
                    </center>
                </div>
            )}
            <Stepper alternativeLabel style={{ paddingTop: 15 }}>
                {steps.map((x, i) => (
                    <Step {...{
                        completed: x.completed,
                        key: i,
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
        </>
    )
}

const FormTitle = ({ rxInputs }) => {
    const classes = useStyles()
    const [status] = useRxSubject(
        rxInputs,
        inputs => findInput(
            inputNames.crowdloanStatus,
            inputs,
        )?.value,
    )

    return (
        <Box sx={{ width: '100%' }}>
            <h4 className={classes.subtitle}>
                {textsCap.contributeTo}
            </h4>
            <h1 className={classes.title}>
                {dappTitle} {textsCap.crowdloan}
            </h1>
            <CrowdloanStatusSteps status={status} />
        </Box>
    )
}
export default React.memo(FormTitle)