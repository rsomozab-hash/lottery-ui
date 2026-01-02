import { useState, useMemo } from "react";
import { Contract } from "ethers";
import LotteryVRF from "../abi/LotteryVRF.json";

interface Props {
  signer: any;
  contractAddress: string;
}

export default function LotteryPanel({ signer, contractAddress }: Props) {
  const [number, setNumber] = useState<number>(0);
  const [currentLottery, setCurrentLottery] = useState<number | null>(null);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * ⛔ MUY IMPORTANTE
   * El contrato DEBE crearse con useMemo
   * Si no, React crea instancias nuevas y rompe sendTransaction
   */
  const contract = useMemo(() => {
    if (!signer) return null;
    return new Contract(contractAddress, LotteryVRF.abi, signer);
  }, [signer, contractAddress]);

  if (!contract) {
    return <p>Conecta la wallet…</p>;
  }

  /* ------------------ USER ------------------ */

  async function buyTicket() {
    try {
      setLoading(true);
      const tx = await contract?.buyTicket(number, {
        value: BigInt("10000000000000000"), // 0.01 ETH
      });
      await tx.wait();
      alert("🎟️ Ticket comprado");
    } catch (e: any) {
      console.error(e);
      alert(e?.reason ?? "Error al comprar ticket");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------ ADMIN ------------------ */

  async function handleStartLottery() {
try {
    setLoading(true);

    const lotteryId = await contract?.currentLotteryId();
    const lottery = await contract?.lotteries(lotteryId);

    if (lottery.finished) {
      const txNext = await contract?.nextLottery();
      await txNext.wait();
      alert("➡️ Nueva lotería creada");
      return;
    }

    if (lottery.vrfRequestId !== 0n) {
      alert("⚠️ Esta lotería ya está iniciada");
      return;
    }

    const tx = await contract?.startLottery({ gasLimit: 1_000_000 });
    await tx.wait();
    alert("🎉 Lotería iniciada correctamente");

  } catch (e: any) {
    console.error(e);
    alert(e?.reason ?? "Error al iniciar la lotería");
  } finally {
    setLoading(false);
  }
  }

  async function finalizeLottery() {
    try {
      setLoading(true);
      const tx = await contract?.finalizeLottery();
      await tx.wait();
      alert("🏁 Lotería finalizada");
    } catch (e: any) {
      console.error(e);
      alert(e?.reason ?? "No se pudo finalizar");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------ READ ------------------ */

  async function fetchCurrentLotteryId() {
    const id = await contract?.currentLotteryId();
    setCurrentLottery(Number(id));
  }

  async function getWinningNumber() {
    if (currentLottery === null) return;

    try {
      const num = await contract?.getWinningNumber(currentLottery);
      setWinningNumber(Number(num));
    } catch (e: any) {
      alert(e?.reason ?? "Aún no hay ganador");
    }
  }

  /* ------------------ UI ------------------ */
  contract.on("LotteryStarted", (lotteryId, startedBy, vrfAddress) => {
    console.log("Lotería iniciada:", lotteryId.toString());
    console.log("Iniciada por:", startedBy);
    console.log("VRF usado:", vrfAddress);
  });
  contract.on("RequestSent", (requestId, num, native, by) =>{
          console.log(`Request ${requestId}`);
          console.log(`Number of words ${num}`)
          console.log(native)
          console.log(`Requested by ${by}`);
        })
  return (
    <div style={{ padding: 20, border: "1px solid gray", borderRadius: 10 }}>
      <h2>🎰 Lotería</h2>

      <button onClick={fetchCurrentLotteryId}>
        Obtener ID actual
      </button>

      {currentLottery !== null && (
        <p>Lotería actual: {currentLottery}</p>
      )}

      <h3>Comprar ticket</h3>
      <input
        type="number"
        min={0}
        max={9999}
        value={number}
        onChange={(e) => setNumber(Number(e.target.value))}
      />
      <button disabled={loading} onClick={buyTicket}>
        Comprar (0.01 ETH)
      </button>

      <h3>Admin</h3>
      <button disabled={loading} onClick={handleStartLottery}>
        Iniciar Lotería
      </button>
      <button disabled={loading} onClick={finalizeLottery}>
        Finalizar Lotería
      </button>

      <h3>Consultar ganador</h3>
      <button onClick={getWinningNumber}>
        Ver número ganador
      </button>

      {winningNumber !== null && (
        <p>🏆 Ganador: {winningNumber}</p>
      )}
    </div>
  );
}
