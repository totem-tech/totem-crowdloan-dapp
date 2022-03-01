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
import blockchainHelper, { crowdloanHelper, softCap } from '../blockchain'
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

    // amtContdLabel: 'amount already contributed',
    // amtPlgLabel: 'amount you would like to pledge',
    // amtPlgLabelDetails: 'You can pledge upto a maximum 10% of your crowdloan contribution.',
    // amtPlgLabelDetails2: 'learn more',
    // amtRewardsLabel: 'estimated rewards',
    // amtRewardsLabelDetails: 'learn more about rewards distribution',
    // amtToContLabel: 'amount you would like to contribute now',
    // amtToContLabelDetails: 'you can always return to contribute as many times as you like before the end of the crowdloan',
    // close: 'close',
    // confirm: 'confirm',
    // contributed: 'contributed',
    // copiedRefLink: 'referral link is copied to the clipboard',
    // copyRefLink: 'copy your referral link',
    // enterAnAmount: 'enter an amount',
    // errAccount1: 'in order to contribute to the Totem KAPEX Parachain Crowdloan, you must create a Totem account.',
    // errAccount2: 'create an account here.',
    // errAccount3: 'alternatively, if you already have an existing Totem account backup file, you can restore it.',
    // errAccount4: 'restore account',
    // errAmtMax: 'please enter an amount smaller than, or equal to',
    // errAmtMin: 'please enter a number greater than',
    // errBackup: 'to safeguard your account please click here to download a backup of your Totem account',
    // errBlockchainConnection: 'failed to connect to blockchain',
    // errFetchContribution: 'failed to retrieve previous contributions',
    // errPledgeSave: 'failed to store contribution data',
    // errSignature: 'signature pre-validation failed',
    // errTxFailed: 'transaction failed',
    // fetchingContributions: 'checking existing contributions...',
    // idLabel: 'select your blockchain identity',
    // idPlaceholder: 'select a blockchain identity',
    // invite1: 'why not invite your friends to Totem?',
    // invite2: 'if your friends contribute you both will earn extra tokens.',
    // missingParaId: 'missing parachain ID',
    // signAndSend: 'sign and send',
    // signatureHeader: 'sign message',
    // signatureMsg: 'you are about to contribute to Totem KAPEX Parachain Crowdloan',
    // signatureMsg2: 'please click continue to approve and sign this transaction.',
    // signTxMsg: 'please sign the transaction on the extension pop up',
    // signDataMsg: 'please sign the message on the extension pop up',
    // submit: 'contribute',
    // transactionCompleted: 'transaction completed successfully.',
    // txSuccessMsg: 'thank you for contributing!',
    // txSuccessMsg2: 'return anytime to contribute more.',
    // transactionMsg: 'Please click Contribute to approve your contribution transaction for the Totem KAPEX Parachain Crowdloan on the Polkadot Relay Chain. Once this transaction is completed your funds will be locked for the duration of the crowdloan (96 weeks). This action is irreversible. Please do not close window until you see a transaction confirmation message.',
    // txInProgress: 'transaction in-progress',
    // txStatus: 'transaction status',
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
                    {shorten(softCap, 0)} {ticker}
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
                    {shorten(hardCap, 0)} {ticker}
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
                            {textsCap.amountRaised}: {shorten(amountRaised)} {ticker}
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
                {crowdloanHelper.title} {textsCap.crowdloan}
            </h1>
            <CrowdloanStatusSteps status={status} />
        </Box>
    )
}
export default React.memo(FormTitle)