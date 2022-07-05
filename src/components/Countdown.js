import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { isDate, isValidNumber } from '../utils/utils'

const CountDown = (props) => {
    const [duration, setDuration] = useState()
    let {
        countUp = false,
        date,
        includeSeconds = true,
        style,
        title,
    } = props

    useEffect(() => {
        const second = 1000
        const minute = second * 60
        const hour = minute * 60
        const day = hour * 24
        const intervalDelayMs = includeSeconds
            ? second
            : minute
        // force convert to Date
        date = new Date(date)
        const updateView = () => {
            if (!isDate(date)) return
            const now = new Date()
            let diffMs = countUp
                ? now - date
                : date - now
            // clear interval if deadline is passed
            if (diffMs <= 0) {
                clearInterval(intervalId)
                return setDuration({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                })
            }

            const days = parseInt(diffMs / day)
            diffMs -= days * day
            const hours = parseInt(diffMs / hour)
            diffMs -= hours * hour
            const minutes = parseInt(diffMs / minute)
            diffMs -= minutes * minute
            const seconds = parseInt(diffMs / second)
            setDuration({
                days,
                hours,
                minutes,
                seconds
            })
        }

        updateView()
        // update every second
        let intervalId = setInterval(updateView, intervalDelayMs)
    }, [])

    const { days, hours, minutes, seconds } = duration || {}
    return !!duration && (
        <div style={style}>
            <h2 style={{
                color: 'deeppink',
                textAlign: 'center',
                margin: 0,
            }}>
                {title}
            </h2>
            <div style={{ textAlign: 'center' }}>
                <NumberBox {...{ number: days, title: 'days' }} />
                <NumberBox {...{ number: hours, title: 'hours' }} />
                <NumberBox {...{ number: minutes, title: 'minutes' }} />
                {includeSeconds && <NumberBox {...{ number: seconds, title: 'seconds' }} />}
            </div>
        </div>
    )
}
CountDown.propTypes = {
    countUp: PropTypes.bool,
    date: PropTypes.oneOfType([
        PropTypes.instanceOf(Date),
        PropTypes.string,
    ]).isRequired,
    includeSeconds: PropTypes.bool,
    style: PropTypes.object,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
    ]),
}

const NumberBox = ({ number, title }) => isValidNumber(number) && (
    <div style={{
        background: 'deeppink',
        color: 'white',
        display: 'inline-block',
        margin: 5,
        minWidth: 60,
        padding: 7,
        textAlign: 'center',
    }}>
        <div style={{
            fontSize: 36,
            fontWeight: 'bolder',
            lineHeight: 1,
        }}>
            {`${number}`.padStart(2, 0)}
        </div>
        <div>
            <small>
                {title}
            </small>
        </div>
    </div>
)

export default React.memo(CountDown)