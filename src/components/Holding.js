import React from 'react'
import { Typography } from '@mui/material';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        background: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: 'Heebo, sans-serif',
        textColor: '#fff',
    },
})
)

export default function Holding() {
    const clases = useStyles();

    return (
        <div className={clases.root} elevation={0}>
            <Typography>
                <br />
                <h1>Totem Crowdloan is coming soon.</h1>
                <h3>Stay tuned by <a href="https://totem.live/?form=newslettersignup">signing up here</a>.</h3>
                <p>Check out our <a href="https://totem.live">testnet app</a>.</p>
                <p>Join us on <a href="https://discord.gg/Vx7qbgn">Discord</a> and <a href="https://t.me/totemchat">Telegram</a></p>
                <p>For more information visit <a href="https://totemaccounting.com">our website.</a></p>
            </Typography>
        </div>
    );
}