import { useState } from "react";
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

  const contract = new Contract(contractAddress, LotteryVRF.abi, signer);

  async function buyTicket() {
    await contract.buyTicket(number, {
      value: "10000000000000000", // 0.01 ETH
    });
    alert("Ticket comprado");
  }
  async function handleStartLottery() {
    
    // const lotteryContract = new ethers.Contract(contractAddress, lotteryAbi, signer);

    try {
        // Intentamos iniciar la lotería
        const data = contract.interface.encodeFunctionData("startLottery");
        console.log("ENCODED DATA:", data);
        const tx = await contract.startLottery();
        await tx.wait();
        alert("Lotería iniciada ✅");
    } catch (error: any) {
        // Detectamos si el error es "Lottery already finished"
        if (error?.reason === "Lottery already finished") {
        alert("La lotería ya terminó, avanzando a la siguiente...");

        try {
            const txNext = await contract.nextLottery();
            await txNext.wait();
            // const tx = await contract.startLottery();
            // await tx.wait();
            alert("Se ha pasado a la siguiente lotería ✅. Vuelve a iniciar el sorteo.");
        } catch (nextError) {
            console.error("Error al avanzar a la siguiente lotería:", nextError);
            alert("No se pudo avanzar a la siguiente lotería.");
        }

        } else {
        console.error("Error al iniciar la lotería:", error);
        alert("Error al iniciar la lotería. Revisa la consola.");
        }
    }
}

  async function fetchCurrentLotteryId() {
    const id = await contract.currentLotteryId();
    setCurrentLottery(Number(id));
  }

  async function getWinningNumber() {
    if (!currentLottery) return;
    try{
      const num = await contract.getWinningNumber(currentLottery);
      setWinningNumber(Number(num));
    }catch(e:any){
      alert(e?.reason)
    }
    
  }

//   async function startLottery() {
//     await contract.startLottery();
//     alert("Solicitud VRF enviada");
//   }

  async function finalizeLottery() {
    await contract.finalizeLottery();
    alert("Lotería finalizada");
  }

  return (
    <div style={{ padding: 20, border: "1px solid gray", borderRadius: 10 }}>
      <h2>🎰 Lotería</h2>

      <button onClick={fetchCurrentLotteryId}>Obtener ID Actual</button>
      {currentLottery !== null && <p>Lotería actual: {currentLottery}</p>}

      <h3>Comprar ticket</h3>
      <input
        type="number"
        min={0}
        max={9999}
        value={number}
        onChange={(e) => setNumber(Number(e.target.value))}
      />
      <button onClick={buyTicket}>Comprar (0.01 ETH)</button>

      <h3>Admin</h3>
      <button onClick={handleStartLottery}>Iniciar Lotería</button>
      <button onClick={finalizeLottery}>Finalizar Lotería</button>

      <h3>Consultar ganador</h3>
      <button onClick={getWinningNumber}>Ver número ganador</button>
      {winningNumber !== null && <p>Ganador: {winningNumber}</p>}
    </div>
  );
}
