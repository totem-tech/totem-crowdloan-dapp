/*
 * Connection to Polkadot network
 */
import { ApiPromise, WsProvider } from '@polkadot/api'
import { query as queryHelper } from '../../utils/polkadotHelper'
import PromisE from '../../utils/PromisE'
import { deferred, isStr } from '../../utils/utils'

const Node_URL = process.env.REACT_APP_POLKADOT_NODE_URL || 'wss://rpc.polkadot.io'
const AUTO_DISCONNECT = process.env.REACT_APP_POLKADOT_AUTO_DISCONNECT === 'true'
// Delay in milliseconds to disconnect after the disconnect function is invoked
const DISCONNECT_DELAY = parseInt(process.env.REACT_APP_POLKADOT_DISCONNECT_DELAY_MS || 1000 * 60 * 15)

export class PolkadotHelper {
    constructor(
        nodeUrls = [Node_URL],
        title = 'Polkadot Network',
        autoDisconnect = AUTO_DISCONNECT,
        disconnectDelay = DISCONNECT_DELAY
    ) {
        this.autoDisconnect = autoDisconnect
        this.connection = {}
        this.disconnectDelay = disconnectDelay
        this.nodeUrls = nodeUrls
        this.title = title
    }

    /**
     * @name    disconnect
     * @summary disconnect from blockchain
     */
    disconnect = deferred(() => {
        this.connection?.provider?.disconnect?.()
        console.log('Disconnected')
    }, this.disconnectDelay)

    /**
     * @name    getBalance
     * @summary get free balance of an identity
     * 
     * @param   {String} address
     * 
     * @returns {Number}
     */
    getBalance = async (address, func = this.connection?.api?.query.system.account) => {
        const { data } = await this.query(func, [address])
        if (isStr(data.free)) {
            data.free = eval(data.free)
        }
        return data
    }

    /**
     * @name            getConnection
     * @summary         initiate a new or get exisiting connection to the Blockchain node
     * 
     * @param {String}  nodeUrls
     * 
     * @returns {Object} an object with the following properties: api, provider
     */
    getConnection = async () => {
        let { provider } = this.connection || {}
        if (!!provider) {
            if (!provider.isConnected) {
                console.log('Provider diconnected. Attempting to reconnect....')
                // provider somehow got disconnected. attempt to reconnect
                provider.connect()
                // wait 2 seconds for reconnection
                await PromisE.delay(2000)
                // wait another 3 seconds if still not connected
                if (!providerisConnected) await PromisE.delay(3000)
                console.log('Provider reconnected', providerisConnected)
            }
            return this.connection
        }
        if (this.connectPromise) {
            await this.connectPromise
            return this.connection
        }

        console.log(`Connecting to ${this.title}`, this.nodeUrls)
        provider = new WsProvider(this.nodeUrls, 100)
        this.connectPromise = ApiPromise.create({ provider })

        const api = await this.connectPromise
        this.connection.api = api
        this.connection.provider = provider
        console.log(`Connected to ${this.title}`, this.connection)
        return this.connection
    }

    /**
     * @name    query
     * @summary retrieve data from Blockchain storage using PolkadotJS API. All values returned will be sanitised.
     *
     * @param   {Function}    func    string: path to the PolkadotJS API function as a string. 
     *                                Eg: 'api.rpc.system.health'
     * @param   {Array}       args    array: arguments to be supplied when invoking the API function.
     *                                To subscribe to the API supply a callback function as the last item in the array.
     * @param   {Boolean}     print   boolean: if true, will print the result of the query
     *
     * @returns {Function|*}  Function/Result: If callback is supplied in @args, will return the unsubscribe function.
     *                        Otherwise, sanitised value of the query will be returned.
     */
    query = async (func, args = [], multi, print) => {
        const connection = await this.getConnection()
        const { api, provider } = connection
        if (!provider?.isConnected) throw `${this.title}: connection failed/disconnected!`

        const result = await queryHelper(api, func, args, multi, print)
        this.autoDisconnect && this.disconnect()
        return result
    }
}

export default new PolkadotHelper(Node_URL, 'Polkadot Blockchain Network', AUTO_DISCONNECT)