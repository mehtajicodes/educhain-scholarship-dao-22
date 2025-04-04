
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { OCConnect } from '@opencampus/ocid-connect-js';
import { User, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Configure the OCID Connect SDK
const ocidConfig = {
  sandbox: true, // Set to false for production
  redirectUrl: window.location.origin, // Redirect back to our app
};

export function ConnectOCID() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [ocidConnected, setOcidConnected] = useState(false);
  const [ocidProfile, setOcidProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're returning from an OCID authentication flow
    const checkAuth = async () => {
      if (window.location.search.includes('code=')) {
        setIsConnecting(true);
        try {
          // Instantiate OCConnect inside the component effect
          const ocidConnect = OCConnect(ocidConfig);
          const result = await ocidConnect.handleRedirect();
          
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
      // Instantiate OCConnect properly - it's a function call, not a constructor
      const ocidConnect = OCConnect(ocidConfig);
      await ocidConnect.login();
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
    toast({
      title: "OCID Disconnected",
      description: "Your Open Campus ID has been disconnected",
    });
  };

  if (ocidConnected && ocidProfile) {
    return (
      <div className="relative">
        <Button 
          variant="outline" 
          onClick={handleDisconnect}
          className="bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
        >
          <User className="mr-2 h-4 w-4" />
          <span>
            {ocidProfile.name || ocidProfile.preferred_username || 'OCID Connected'}
          </span>
        </Button>
      </div>
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
