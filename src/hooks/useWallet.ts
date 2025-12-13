// useWallet.tsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7"; // 11155111
const SEPOLIA_CHAIN_ID_DEC = 11155111;

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  async function requestNetworkSwitch() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (err: any) {
      // En caso de que Sepolia no esté agregada en MetaMask
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID_HEX,
              chainName: "Sepolia Testnet",
              rpcUrls: ["https://rpc.sepolia.org"],
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        console.error("Error switching network:", err);
      }
    }
  }

  async function connect() {
    if (!window.ethereum) {
      alert("MetaMask no está instalada");
      return;
    }

    // Pedir conexión a la wallet
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const _provider = new ethers.BrowserProvider(window.ethereum);
    const _signer = await _provider.getSigner();
    const _address = await _signer.getAddress();
    const network = await _provider.getNetwork();

    setProvider(_provider);
    setSigner(_signer);
    setAddress(_address);
    setChainId(Number(network.chainId));

    // Si no está en Sepolia → pedir al usuario cambiar
    if (Number(network.chainId) !== SEPOLIA_CHAIN_ID_DEC) {
      console.warn("⚠️ No estás en Sepolia. Intentando cambiar…");
      await requestNetworkSwitch();
    }
  }

  // AUTO-DETECTAR CAMBIO DE RED O CUENTA
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", () => {
      connect();
    });

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  }, []);

  return {
    provider,
    signer,
    address,
    chainId,
    connect,
    isConnected: !!address && chainId === SEPOLIA_CHAIN_ID_DEC,
  };
}
