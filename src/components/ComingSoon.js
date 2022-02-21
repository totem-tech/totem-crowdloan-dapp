import React from 'react'
import { CssBaseline, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundImage: 'url(./images/landing-background.svg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        minHeight: '100vh',
    },
    child: {
        alignItems: 'center',
        background: 'none',
        color: '#fff',
        display: 'flex',
        fontFamily: 'Heebo, sans-serif',
        height: '100vh',
        justifyContent: 'center',
        textAlign: 'center',
    },
    link: {
        color: 'white',
        '&:active': {
            color: 'red',
            fontWeight: 'bold',
        },
    },
}))

export default function ComingSoon() {
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <CssBaseline />
            <div className={classes.child} elevation={0}>
                <Typography>
                    <br />
                    <h1>Totem Crowdloan is coming soon.</h1>
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
        </div>
    )
}