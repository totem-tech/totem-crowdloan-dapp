import { cryptoWaitReady } from '@polkadot/util-crypto'
import identityHelper from '../../utils/substrate/identityHelper'
import { subjectAsPromise } from '../../utils/reactHelper'
import { isNodeJS } from '../../utils/utils'

// Enable polkadotJS extension
export default async function enableExtionsion() {
    if (isNodeJS()) return
    // wait until identity helper initiated
    await subjectAsPromise(
        identityHelper.rxSelected,
        selected => !!selected && selected,
    )

    console.log('Enable extension')

    await cryptoWaitReady()
    return await identityHelper.enableExtionsion('Totem Crowdloan DApp')
}