// import { ChatClient, getClient, rxIsConnected } from '../../utils/chatClient'
// import { setSelected } from '../../utils/languageHelper'
// import { subjectAsPromise } from '../../utils/reactHelper'
// // import storage from '../../utils/storageHelper'
// // import { generateHash } from '../../utils/utils'

// const SERVER_URL = process.env.REACT_APP_MESSAGING_SERVER_URL
// let client
// /**
//  * 
//  * 
//  * @returns {ChatClient}
//  */
// export default async function _getClient() {
//     if (!SERVER_URL) throw new Error('Missing messaging server websocket URL')

//     if (!client) {
//         client = getClient(SERVER_URL)
//         client.onError(console.warn)
//     }

//     setSelected('EN', client)
//     // await subjectAsPromise(rxIsConnected, true)[0]
//     return client
// }