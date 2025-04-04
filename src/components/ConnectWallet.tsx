
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useWallet } from '@/hooks/use-wallet';
import { Shield, Unlock, Lock } from 'lucide-react';

export function ConnectWallet() {
  const { isConnected, address, isLoading, connectWallet, disconnectWallet, formatAddress } = useWallet();
  const [showDisconnect, setShowDisconnect] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <div className="relative">
          <Button 
            variant="outline" 
            onClick={() => setShowDisconnect(!showDisconnect)}
            className="bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100"
          >
            <Shield className="mr-2 h-4 w-4" />
            <span className="font-mono">{formatAddress(address)}</span>
          </Button>
          
          {showDisconnect && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-full mt-1 right-0 z-10"
              onClick={() => {
                disconnectWallet();
                setShowDisconnect(false);
              }}
            >
              <Lock className="mr-2 h-3 w-3" />
              Disconnect
            </Button>
          )}
        </div>
      ) : (
        <Button 
          onClick={connectWallet} 
          disabled={isLoading}
          className="bg-purple-700 hover:bg-purple-800 text-white"
        >
          <Unlock className="mr-2 h-4 w-4" />
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  );
}
