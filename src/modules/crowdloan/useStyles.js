import { makeStyles } from '@mui/styles'

export default makeStyles(() => ({
    contributed: {
        fontSize: 12,
        position: 'absolute',
        bottom: -4,
        fontWeight: 'bold',
        right: 16,
        color: 'deeppink',
    },
    link: {
        color: 'orange',
        '&:active': {
            color: 'orange',
            fontWeight: 'bold',
        },
    },
    root: {
        background: 'white',
        borderRadius: 5,
        // boxShadow: '7px 7px #f0f0f04f',
        padding: 25,
    },
    subtitle: {
        color: 'deeppink',
        margin: 0,
        lineHeight: 1,
    },
    title: {
        borderBottom: '1px solid deeppink',
        color: 'deeppink',
        lineHeight: 1,
        margin: 0,
        paddingBottom: 5,
        hiteSpace: 'nowrap',
    },
}))