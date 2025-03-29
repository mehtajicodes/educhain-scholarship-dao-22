
import { useState, useEffect } from 'react';

interface MetaMaskError {
  code: number;
  message: string;
}

const EDUCHAIN_CHAIN_ID = '0xa0348';  // '656476' in decimal is '0xa0348' in hex
const EDUCHAIN_CONFIG = {
  chainId: EDUCHAIN_CHAIN_ID,
  chainName: 'EDU Chain Testnet',
  nativeCurrency: {
    name: 'EduChain Ether',
    symbol: 'EDU',
    decimals: 18,
  },
  rpcUrls: ['https://open-campus-codex-sepolia.drpc.org'],
  blockExplorerUrls: ['https://opencampus-codex.blockscout.com/'],
};

export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkNetwork = async () => {
    if (!window.ethereum) return false;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== EDUCHAIN_CHAIN_ID) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: EDUCHAIN_CHAIN_ID }],
        }).catch(async (switchError: MetaMaskError) => {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [EDUCHAIN_CONFIG],
            });
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Error checking/switching network:', error);
      return false;
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    setIsLoading(true);
    try {
      const networkOk = await checkNetwork();
      if (!networkOk) {
        alert('Please switch to EduChain network');
        setIsLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAddress(accounts[0]);
      setIsConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress('');
    setIsConnected(false);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        });

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress('');
          setIsConnected(false);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return {
    isConnected,
    address,
    isLoading,
    connectWallet,
    disconnectWallet,
    formatAddress,
  };
};
