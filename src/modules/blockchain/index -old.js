import { BehaviorSubject } from 'rxjs'
import { connect } from '../../utils/polkadotHelper'
import PromisE from '../../utils/PromisE'

const NODE_URL = process.env.NODE_URL || 'wss://rpc.polkadot.io'
let connectPromise = null
const rxConnection = new BehaviorSubject({
    provider: null,
})

export default async () => {
    console.info('Connecting to Polkadot network using', NODE_URL)
    const { pending, rejected, resolved } = connectPromise || {}

    if (rejected || !pending && !resolved) {
        const connection = await new PromisE(connect && connect(NODE_URL))
        console.info('Connected to the Polkadot network', { connection })
        rxConnection.next(connection)
        return connection
    }

    // Connection already initiated. Use the the existing promise
    return await connectPromise
}