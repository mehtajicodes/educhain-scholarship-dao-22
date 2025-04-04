
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { OCConnect, useOCAuth } from '@opencampus/ocid-connect-js';
import { User, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Configure the OCID Connect SDK
const ocidConfig = {
  opts: {
    redirectUri: window.location.origin, // Redirect back to our app
    referralCode: 'SCHOLARDAO' // Unique identifier for our app
  },
  sandboxMode: true // Set to false for production
};

export function ConnectOCID() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [ocidConnected, setOcidConnected] = useState(false);
  const [ocidProfile, setOcidProfile] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're returning from an OCID authentication flow
    const checkAuth = async () => {
      if (window.location.search.includes('code=')) {
        setIsConnecting(true);
        try {
          // Use the useOCAuth hook directly
          const ocAuth = await import('@opencampus/ocid-connect-js').then(module => 
            new module.OCAuthSandbox(ocidConfig.opts)
          );
          
          if (ocAuth.handleLoginRedirect) {
            const result = await ocAuth.handleLoginRedirect();
            
            if (result && result.profile) {
              setOcidProfile(result.profile);
              setOcidConnected(true);
              
              // Store OCID in localStorage for persistence
              localStorage.setItem('ocid_profile', JSON.stringify(result.profile));
              
              toast({
                title: "OCID Connected",
                description: `Welcome, ${result.profile.name || 'User'}!`,
              });
            }
          }
        } catch (error) {
          console.error('OCID connection error:', error);
          toast({
            title: "Connection Failed",
            description: "Could not connect to Open Campus ID",
            variant: "destructive",
          });
        } finally {
          setIsConnecting(false);
          
          // Clean up the URL params
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    
    // Check for stored profile
    const storedProfile = localStorage.getItem('ocid_profile');
    if (storedProfile) {
      try {
        setOcidProfile(JSON.parse(storedProfile));
        setOcidConnected(true);
      } catch (e) {
        localStorage.removeItem('ocid_profile');
      }
    }
    
    checkAuth();
  }, [toast]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Initialize the OCID SDK properly
      const ocAuth = await import('@opencampus/ocid-connect-js').then(module => 
        new module.OCAuthSandbox(ocidConfig.opts)
      );
      
      if (ocAuth.signInWithRedirect) {
        await ocAuth.signInWithRedirect();
      } else {
        throw new Error("Login method not available");
      }
    } catch (error) {
      console.error('Failed to initiate OCID login:', error);
      setIsConnecting(false);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Open Campus ID",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('ocid_profile');
    setOcidConnected(false);
    setOcidProfile(null);
    setShowProfileDialog(false);
    toast({
      title: "OCID Disconnected",
      description: "Your Open Campus ID has been disconnected",
    });
  };

  const handleShowProfile = () => {
    setShowProfileDialog(true);
  };

  if (ocidConnected && ocidProfile) {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={handleShowProfile}
          className="bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
        >
          <User className="mr-2 h-4 w-4" />
          <span>
            {ocidProfile.name || ocidProfile.preferred_username || 'OCID Connected'}
          </span>
        </Button>

        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>OCID Profile</DialogTitle>
              <DialogDescription>
                Your Open Campus ID profile information
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {ocidProfile.picture && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={ocidProfile.picture} 
                    alt="Profile" 
                    className="rounded-full w-20 h-20 object-cover border-2 border-amber-300"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Name:</span>
                  <span className="font-semibold">{ocidProfile.name || 'Not provided'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Email:</span>
                  <span className="font-semibold">{ocidProfile.email || 'Not provided'}</span>
                </div>
                
                {ocidProfile.ocid && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-500">OCID:</span>
                    <span className="font-semibold">{ocidProfile.ocid}</span>
                  </div>
                )}
                
                {ocidProfile.eth_address && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-500">ETH Address:</span>
                    <span className="font-semibold text-sm">{ocidProfile.eth_address}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
              >
                Disconnect OCID
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isConnecting}
      className="bg-amber-600 hover:bg-amber-700 text-white"
    >
      <Lock className="mr-2 h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect with OCID"}
    </Button>
  );
}
