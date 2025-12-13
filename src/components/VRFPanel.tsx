import { Contract } from "ethers";
import vrfAbi from "../abi/DirectFundingConsumer.json";

export default function VRFPanel({ signer, contractAddress }: any) {
  const contract = new Contract(contractAddress, vrfAbi.abi, signer);

  async function request() {
    await contract.requestRandomWords(false);
    alert("VRF solicitado");
  }

  return (
    <div style={{ padding: 20, border: "1px solid gray", borderRadius: 10 }}>
      <h2>🔮 VRF</h2>
      <button onClick={request}>Solicitar Aleatorio</button>
    </div>
  );
}
