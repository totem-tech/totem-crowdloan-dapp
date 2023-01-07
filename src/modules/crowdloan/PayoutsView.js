import { Card, CardContent, List, ListItem, ListItemText, Paper, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { BehaviorSubject, map } from 'rxjs'
import FormBuilder from '../../components/form/FormBuilder'
import { rxIsConnected } from '../../utils/chatClient'
import { addressToStr } from '../../utils/convert'
import { translated } from '../../utils/languageHelper'
import { iUseReducer, subjectAsPromise, useRxSubject } from '../../utils/reactHelper'
import identityHelper from '../../utils/substrate/identityHelper'
import { deferred, objWithoutKeys } from '../../utils/utils'
import getClient from '../messaging'
import { enableExtionsion } from './checkExtension'
import { identityOptionsModifier } from './CrowdloanForm'
import useStyles from './useStyles'

let textsCap = {
    contributed: 'contributed',
    contributedToCrowdloan: 'contributed to crowdloan',
    crowdloandNPledgeReward: 'crowdloan & pledge reward',
    identityLabel: 'select identity',
    identityPlaceholder: 'select your identity',
    migratedRewards: 'migrated testnet rewards',
    pledged: 'pledged',
    pledgeFulfilled: 'pledge fulfilled',
    referralReward: 'referral reward',
    totalPayout: 'total payout',
}
textsCap = translated(textsCap, true)[1]

const inputNames = {
    identity: 'identity',
    payoutDetails: 'payoutDetetails'
}

export default function PayoutsView(props) {
    const classes = useStyles()
    const rxKapexPayouts = useMemo(() => new BehaviorSubject(new Map()), [])
    const [state, setState] = iUseReducer(null, getInitialState(classes, rxKapexPayouts))
    useRxSubject(identityHelper.rxIdentities, deferred(async (identities = new Map()) => {
        const addresses = [...identities.keys()]
            .map(x => addressToStr(x, false, 0))
        const client = await getClient()
        const payouts = await client
            .emit('rewards-get-kapex-payouts', [addresses])
            .catch(_ => [])
        const payoutsMap = new Map(payouts)
        addresses.forEach(address => !payoutsMap.get(address) && payoutsMap.set(address, {}))
        rxKapexPayouts.next(payoutsMap)
    }), 300)

    return (
        <FormBuilder {...{
            ...props,
            ...state,
            formProps: {
                className: classes.root,
            },
            submitButton: null
        }} />
    )
}

const getInitialState = (classes, rxKapexPayouts) => rxSetState => {
    const rxValues = new BehaviorSubject({})
    const rxSelectOpen = new BehaviorSubject(false)
    const rxInputs = new BehaviorSubject([
        {
            label: textsCap.identityLabel,
            name: inputNames.identity,
            onClose: () => rxSelectOpen.next(false),
            onOpen: () => rxSelectOpen.next(true),
            placeholder: textsCap.identityPlaceholder,
            rxOptions: identityHelper.rxIdentities,
            rxOptionsModifier: identityOptionsModifier(
                rxInputs,
                classes,
                getSubtitle(rxKapexPayouts, rxSelectOpen),
            ),
            type: 'select',
        },
        {
            content: (
                <PayoutDetails {...{
                    rxKapexPayouts,
                    rxValues,
                }} />
            ),
            name: inputNames.payoutDetails,
            type: 'html',
        }
    ])

    return {
        rxInputs,
        rxValues,
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
        currency = 'KAPEX',
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
        <List {...{
            className: classes.payoutDetailsRoot,
            key: address,
        }}>
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
    )
}
