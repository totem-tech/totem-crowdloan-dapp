import React from 'react'
import { Box, CssBaseline, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
    link: {
        color: 'white',
        '&:active': {
            color: 'red',
            fontWeight: 'bold',
        },
    },
    root: {
        background: 'none',
        color: '#fff',
        display: 'flex',
        fontFamily: 'Heebo, sans-serif',
        height: 'calc( 100% - 144px )',
        justifyContent: 'center',
        paddingTop: 'calc( 100vh * .15 )',
        textAlign: 'center',
    },
}))

export default function ComingSoon() {
    const classes = useStyles()

    return (
        <div className={classes.root} elevation={0}>
            <Typography component='div'>
                <br />
                <h1>Totem KAPEX Parachain Crowdloan is coming soon.</h1>
                <h3>
                    Stay tuned by{' '}
                    <a className={classes.link} href='https://totem.live/?form=newslettersignup'>
                        signing up here
                    </a>.
                </h3>
                <p>
                    Check out our <a className={classes.link} href='https://totem.live'>testnet app</a>.
                </p>
                <p>
                    Join us on{' '}
                    <a
                        className={classes.link}
                        href='https://discord.gg/Vx7qbgn'
                        target='_blank'
                    >
                        Discord
                    </a>
                    {' and '}
                    <a className={classes.link} href='https://t.me/totemchat'>Telegram</a>
                </p>
                <p>
                    For more information visit <a className={classes.link} href='https://totemaccounting.com'>our website.</a>
                </p>
            </Typography>
        </div>
    )
}