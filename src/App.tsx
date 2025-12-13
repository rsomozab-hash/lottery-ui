import LotteryPanel from "./components/LotteryPanel";
import VRFPanel from "./components/VRFPanel";
import { useWallet } from "./hooks/useWallet";

function App() {
  const {
    address,
    signer,
    connect,
    isConnected,
    chainId
  } = useWallet();

  const lotteryAddress = "0x927fEAE452cdBc26e6fFFf8ecF8C6Cbda5CBD95d";
  const vrfAddress = "0x4FF0Da243DFEAf3097Ce78472a1ee8e37a18210D";

  return (
    <div style={{ padding: 40 }}>
      <h1>🎟️ DApp Lotería con Chainlink VRF</h1>

      {!isConnected && (
        <button onClick={connect}>Conectar Wallet</button>
      )}

      {isConnected && (
        <>
          <p>Conectado como: {address}</p>
          <p>Red: {chainId}</p>
        </>
      )}

      {isConnected && signer && (
        <>
          <LotteryPanel signer={signer} contractAddress={lotteryAddress} />
          <VRFPanel signer={signer} contractAddress={vrfAddress} />
        </>
      )}
    </div>
  );
}

export default App;
