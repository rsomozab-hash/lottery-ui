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

  const lotteryAddress = "0xdD91f5b10b220E779e9CC60B560FEE6cF36DAbaD";
  const vrfAddress = "0x21b069640B647dbabB7A06519Cfd1329c51CB23b";

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
