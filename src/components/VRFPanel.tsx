import { Contract } from "ethers";
import { useEffect, useState } from "react";
import DirectFundingConsumer from "../abi/DirectFundingConsumer.json";

export default function VRFPanel({ signer, contractAddress }: any) {
  const contract = new Contract(contractAddress, DirectFundingConsumer.abi, signer);
  
  const [lastRequestId, setLastRequestId] = useState<bigint | null>(null);
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function request() {
    try {
      setLoading(true);
      setRandomNumber(null);
      const tx = await contract.requestRandomWords(false, {gasLimit: 1_000_000});
      await tx.wait();

      const requestId = await contract.lastRequestId();
      setLastRequestId(BigInt(requestId));

      alert(`VRF solicitado. Request ID: ${requestId}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.reason ?? "Error solicitando VRF");
      setLoading(false);
    }
  }

  async function fetchRandom() {
    if (!lastRequestId) return;

    try {
      const num = await contract.getRandomInRange(lastRequestId, 0, 100, );
      setRandomNumber(Number(num));
    } catch (e: any) {
      console.log(e);
      alert("El número aún no está listo (espera a Chainlink)");
    }
  }

  // Escuchar cuando Chainlink responde
  useEffect(() => {
    const handler = (requestId: bigint, randomWords: bigint[]) => {
      console.log("VRF fulfilled:", requestId.toString());
      console.log("RandomWords: ", randomWords.toString());
      setLoading(false);
    };

    contract.on("RequestFulfilled", handler);

    return () => {
      contract.off("RequestFulfilled", handler);
    };
  }, [contract]);

  return (
    <div style={{ padding: 20, border: "1px solid gray", borderRadius: 10 }}>
      <h2>🔮 VRF</h2>

      <button onClick={request} disabled={loading}>
        Solicitar Aleatorio
      </button>

      {lastRequestId && (
        <>
          <p>Request ID: {lastRequestId}</p>
          <button onClick={fetchRandom}>
            Obtener número (0–100)
          </button>
        </>
      )}

      {randomNumber !== null && (
        <h3>🎯 Número aleatorio: {randomNumber}</h3>
      )}
    </div>
  );
}
