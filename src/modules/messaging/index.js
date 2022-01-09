import { getClient, rxIsConnected } from '../../utils/chatClient'
import { subjectAsPromise } from '../../utils/reactHelper'
import storage from '../../utils/storageHelper'
import { generateHash } from '../../utils/utils'

const SERVER_URL = process.env.REACT_APP_MESSAGING_SERVER_URL
let client
export default async function connect() {
    if (!SERVER_URL) throw new Error('Missing messaging server websocket URL')

    if (!client) {
        console.log('Connecting to Totem Messaging service', SERVER_URL)
        client = getClient(SERVER_URL)
        client.onConnect(() => console.log('Connected to Totem Messaging service'))
        client.onError(console.warn)
    }
    await subjectAsPromise(rxIsConnected, true)[0]
    return client
}

const init = () => {
    const hash = generateHash(storage.countries.toArray())
    client
        .countries
        .promise(hash)
        .then(countries => console.log({ countries }))
}

// wait until messaging server is connected successfully
subjectAsPromise(rxIsConnected, true)[0]
    .then(init) 