import React from 'react'
import { Box, CssBaseline, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { imgPathBg, imgPathJointLogo } from '../constants'

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundImage: `url(${imgPathBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
    },
    link: {
        color: 'white',
        '&:active': {
            color: 'red',
            fontWeight: 'bold',
        },
    },
    bannerContainer: {
        display: 'block',
        textAlign: 'center',
        width: '100%',
    },
    logo: {
        margin: '30px 0 0 -15px',
        maxWidth: '90%',
    },
}))

export default function AppContainer({ children }) {
    const classes = useStyles()

    return (
        <Box className={classes.root}>
            <CssBaseline />
            <div className={classes.bannerContainer}>
                <img src={imgPathJointLogo} alt="logos" className={classes.logo} />
            </div>
            {children}
        </Box>
    )
}