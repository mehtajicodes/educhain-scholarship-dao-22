
import { useState, useEffect } from 'react';
import { supabase, authenticateWithWallet } from '@/integrations/supabase/client';

interface MetaMaskError {
  code: number;
  message: string;
}

const EDUCHAIN_CHAIN_ID = '656476';  // '656476' in decimal is '0xa0348' in hex
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const authenticateUser = async (walletAddress: string) => {
    if (!walletAddress) return;
    
    try {
      const { data, error } = await authenticateWithWallet(walletAddress);
      
      if (error) {
        console.error("Authentication error:", error);
        return false;
      }
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Error during authentication:", error);
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

      const currentAddress = accounts[0];
      setAddress(currentAddress);
      setIsConnected(true);
      
      // Authenticate with Supabase using the wallet address
      await authenticateUser(currentAddress);
      
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
    setIsAuthenticated(false);
    
    // Sign out from Supabase
    supabase.auth.signOut();
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(async (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            
            // Re-authenticate if wallet is already connected
            await authenticateUser(accounts[0]);
          }
        });

      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          
          // Re-authenticate when account changes
          await authenticateUser(accounts[0]);
        } else {
          setAddress('');
          setIsConnected(false);
          setIsAuthenticated(false);
          
          // Sign out from Supabase
          supabase.auth.signOut();
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
    isAuthenticated,
    connectWallet,
    disconnectWallet,
    formatAddress,
  };
};
