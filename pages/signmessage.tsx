import * as React from 'react'
import { useSignMessage, useAccount } from 'wagmi'
import { recoverMessageAddress } from 'viem'
import axios from 'axios'

export function SignMessage() {
    const { address, connector, isConnected } = useAccount()
    const [recoveredAddress, setRecoveredAddress] = React.useState('')
    const { data: signMessageData, error, isLoading, signMessage, variables } = useSignMessage()
    const [message, setMessage] = React.useState('')
    const [result, setResult] = React.useState('')

    React.useEffect(() => {
        ; (async () => {
            if (variables?.message && signMessageData) {
                const recoveredAddress = await recoverMessageAddress({
                    message: variables?.message,
                    signature: signMessageData,
                })
                setRecoveredAddress(recoveredAddress)
                const result = await axios.post('https://api.umi.tools/store/put', {
                    "address": address?.toLowerCase(),
                    "topic": "TOPIC",
                    "key": "KEY",
                    "value": message,
                    "signature": signMessageData
                })
                setResult(JSON.stringify(result.data))
            }
        })()
    }, [signMessageData, variables?.message])

    return (
        <div suppressHydrationWarning
            style={{ width: '100%', textAlign: 'center', maxWidth: 450, wordBreak: 'break-all', fontFamily: "monospace" }}>

            <form suppressHydrationWarning
                onSubmit={(event) => {
                    const toSign = `${address?.toLowerCase()}:TOPIC:KEY:put`
                    console.log("Message is:" + toSign)
                    event.preventDefault()
                    signMessage({ message: toSign })
                }}
            >
                <label htmlFor="message">Enter a message to sign</label><br></br><br></br>
                <textarea
                    style={{ width: '100%' }}
                    id="message"
                    name="message"
                    placeholder="The quick brown fox…"
                    onKeyUp={(event) => setMessage(event.currentTarget.value)}
                /><br></br><br></br>
                <button style={{ fontFamily: "monospace" }} disabled={isLoading}>
                    {isLoading ? 'Check Wallet' : 'SIGN MESSAGE'}
                </button><br></br><br></br>
                {recoveredAddress.length > 0 && (
                    <div>
                        <div><b>Recovered Address: </b>{recoveredAddress}</div><br></br>
                        <div><b>Signature: </b>{signMessageData}</div>
                    </div>
                )}

                {error && <div>{error.message}</div>}
            </form>
            {result.length > 0 && (
                <div>
                    <br></br><div><b>Result: </b>{result}</div>
                </div>
            )}
        </div>
    )
}