import {
    FormControl,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Select,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { BehaviorSubject } from 'rxjs'
import { addressToStr } from '../../utils/convert'
import { translated } from '../../utils/languageHelper'
import {
    FormBuilder,
    RxSubjectView,
    subjectAsPromise,
    useRxState,
    useRxSubject,
} from '../../utils/reactjs'
import identityHelper from '../../utils/substrate/identityHelper'
import { deferred } from '../../utils/utils'
import chatClient from '../../utils/chatClient'
import { identityOptionsModifier } from './CrowdloanForm'
import useStyles from './useStyles'

const textsCap = {
    contributed: 'contributed',
    contributedToCrowdloan: 'contributed to crowdloan',
    crowdloandNPledgeReward: 'crowdloan & pledge reward',
    identityLabel: 'select identity',
    identityPlaceholder: 'select your identity',
    kapexPayouts: 'KAPEX payouts',
    migratedRewards: 'migrated testnet rewards',
    pledged: 'pledged',
    pledgeFulfilled: 'pledge fulfilled',
    referralReward: 'referral reward',
    totalPayout: 'total payout',
}
translated(textsCap, true)

const inputNames = {
    identity: 'identity',
}
const rxKapexPayouts = new BehaviorSubject(new Map())

identityHelper.rxIdentities.subscribe(
    deferred(
        async (identities = new Map()) => {
            const keys = [...identities.keys()]
            const addresses = keys
                .map(x => addressToStr(x, false, 0))
            const payoutsMap = new Map(
                await chatClient
                    .rewardsGetKapexPayouts(addresses)
                    .catch(err => console.error(err, addresses))
            )
            addresses.forEach(address =>
                !payoutsMap.get(address)
                && payoutsMap.set(address, {})
            )
            rxKapexPayouts.next(payoutsMap)
        },
        500
    )
)

export default function PayoutsView(props) {
    const classes = useStyles()
    const [state] = useRxState(getInitialState(classes, rxKapexPayouts))

    return (
        <FormBuilder {...{
            ...props,
            ...state,
            formProps: {
                className: classes.root,
            },
            prefix: (
                <h1 className={classes.title}>
                    {textsCap.kapexPayouts}
                </h1>
            ),
            suffix: (
                <PayoutDetails {...{
                    rxKapexPayouts,
                    rxValues: state.values,
                }} />
            ),
            submitText: null
        }} />
    )
}

const getInitialState = (classes, rxKapexPayouts) => rxSetState => {
    const rxValues = new BehaviorSubject({})
    const rxSelectOpen = new BehaviorSubject(false)
    const rxInputs = new BehaviorSubject([
        {
            components: {
                Container: FormControl,
                Input: Select,
                OptionItem: MenuItem,
            },
            containerProps: {
                fullWidth: true,
            },
            inputProps: {
                onClose: () => rxSelectOpen.next(false),
                onOpen: () => rxSelectOpen.next(true),
            },
            label: textsCap.identityLabel,
            labelDetails: (
                <RxSubjectView {...{
                    subject: [rxSelectOpen, rxValues],
                    valueModifier: ([open, values]) => !open
                        && !values[inputNames.identity]
                        && textsCap.identityPlaceholder
                }} />
            ),
            labelDetailsProps: {
                style: {
                    position: 'absolute',
                    fontWeight: 'normal',
                    padding: 15,
                    zIndex: 0,
                }
            },
            name: inputNames.identity,
            rxOptions: identityHelper.rxIdentities,
            rxOptionsModifier: identityOptionsModifier(
                rxInputs,
                classes,
                getSubtitle(rxKapexPayouts, rxSelectOpen),
            ),
            type: 'select',
        }
    ])

    return {
        inputs: rxInputs,
        values: rxValues,
    }
}

const getSubtitle = (rxKapexPayouts, rxSelectOpen) => address => (
    <Contributed {...{
        address,
        rxKapexPayouts,
        rxSelectOpen,
    }} />
)

const Contributed = props => {
    const {
        address,
        rxKapexPayouts,
        rxSelectOpen,
    } = props
    const classes = useStyles()
    const polkadotAddress = addressToStr(address, false, 0)
    const [payout] = useRxSubject(
        rxKapexPayouts,
        payouts => payouts.get(polkadotAddress) || {},
    )
    const [show] = useRxSubject(rxSelectOpen)
    const {
        dotCrowdloaned,
        dotPledged,
        kapexTotal,
    } = payout

    return !show
        ? ''
        : (
            <div className={classes.contributed}>
                {dotCrowdloaned && (
                    <span>
                        {textsCap.contributed}: {dotCrowdloaned} DOT
                        {!!dotPledged && (
                            <span> | {textsCap.pledged}: {dotPledged} DOT</span>
                        )}
                    </span>
                )}
            </div>
        )
}

const PayoutDetails = props => {
    const { rxKapexPayouts, rxValues } = props
    const [address] = useRxSubject(rxValues, value =>
        addressToStr(
            value[inputNames.identity],
            false,
            0,
        )
    )
    const [payout, setPayout] = useState()
    const classes = useStyles()

    useEffect(() => {
        if (!rxKapexPayouts) return () => { }

        let mounted = true
        const [promise, unsubscribe] = subjectAsPromise(
            rxKapexPayouts,
            payouts => !!payouts.get(address) && payouts,
        )
        promise.then(payouts => mounted && setPayout(payouts.get(address)))

        return () => {
            mounted = false
            unsubscribe()
        }
    }, [address, rxKapexPayouts])

    if (!address) return ''
    const {
        dotCrowdloaned = 0,
        dotPledged = 0,
        kapexMigrated = 0,
        kapexReward = 0,
        kapexRewardReferral = 0,
        kapexTotal = 0,
    } = payout || {}

    const toCurrency = (
        amount,
        currency = 'KPX',
        decimals = 8,
    ) => `${amount.toFixed(decimals)} ${currency}`

    const list = [
        {
            primary: textsCap.contributedToCrowdloan,
            secondary: toCurrency(dotCrowdloaned, 'DOT'),
        },
        {
            primary: textsCap.pledgeFulfilled,
            secondary: toCurrency(dotPledged, 'DOT'),
        },
        {
            primary: textsCap.crowdloandNPledgeReward,
            secondary: toCurrency(kapexReward)
        },
        kapexRewardReferral && {
            primary: textsCap.referralReward,
            secondary: toCurrency(kapexRewardReferral)
        },
        kapexMigrated && {
            primary: textsCap.migratedRewards,
            secondary: toCurrency(kapexMigrated)
        },
        {
            primary: textsCap.totalPayout,
            secondary: toCurrency(kapexTotal + kapexMigrated)
        },
    ].filter(Boolean)

    return (
        <div {...{
            className: classes.payoutDetailsRoot,
            key: address,
        }}>
            <List>
                {list.map(({ className = classes.payoutDetailsItem, primary, secondary }) => (
                    <ListItem {...{ className, key: primary }}>
                        <ListItemText {...{
                            primary: (
                                <span className={classes.payoutDetailsTitle}>
                                    {primary}
                                </span>
                            ),
                            secondary,
                        }} />
                    </ListItem>
                ))}
            </List>
        </div>
    )
}