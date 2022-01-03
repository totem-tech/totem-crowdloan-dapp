import { getClient, rxIsConnected } from '../../utils/chatClient'

let client
export default function () {
    if (!client) {
        console.log('Connecting to messaging server')
        const msURL = 'wss://localhost:3001'
        client = getClient(msURL)
        client.onConnect(() => console.log('Connected to', msURL))
        client.onError(console.warn)
    }
    return client
}

rxIsConnected.subscribe(connected => {
    if (!connected) return

    client
        .countries
        .promise('')
        .then(r => console.info('List of countries', r))
})