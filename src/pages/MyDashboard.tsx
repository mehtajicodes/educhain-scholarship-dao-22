
import { Header } from "@/components/Header";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { CreateScholarshipForm } from "@/components/CreateScholarshipForm";
import { AnonAadhaarLogin } from "@/components/AnonAadhaarLogin";
import { useDAO } from "@/contexts/DAOContext";
import { useAnonAadhaarContext } from "@/contexts/AnonAadhaarContext";
import { useWallet } from "@/hooks/use-wallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, ArrowRight, User, Shield } from "lucide-react";

const MyDashboard = () => {
  const { myScholarships } = useDAO();
  const { isVerified, userDetails } = useAnonAadhaarContext();
  const { isConnected, address, formatAddress } = useWallet();

  const createdScholarships = myScholarships.filter(s => s.creator === address);
  const appliedScholarships = myScholarships.filter(s => s.recipient === address);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-edu-dark mb-8">My Dashboard</h1>
        
        {!isConnected ? (
          <div className="max-w-md mx-auto my-8 text-center">
            <div className="bg-yellow-50 p-6 rounded-lg mb-6">
              <User className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-xl font-bold text-edu-dark mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                You need to connect your wallet to view your dashboard.
              </p>
              <Button className="bg-edu-primary hover:bg-edu-primary/90">
                Connect Wallet
              </Button>
            </div>
          </div>
        ) : !isVerified ? (
          <div className="max-w-md mx-auto my-8">
            <div className="bg-yellow-50 p-4 rounded-lg mb-6 flex items-start gap-3 text-yellow-800">
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Verification Required</p>
                <p className="mt-1 text-sm">
                  You need to verify your identity with Aadhaar to access your dashboard.
                </p>
              </div>
            </div>
            <AnonAadhaarLogin />
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Wallet Address</p>
                      <p className="font-mono text-sm truncate">{address}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Shield className="h-4 w-4" />
                      <span>Identity Verified</span>
                    </div>
                    
                    {userDetails && (
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Verified Details</p>
                        <ul className="text-sm space-y-1">
                          {userDetails.isAbove18 !== undefined && (
                            <li>Age: {userDetails.isAbove18 ? 'Above 18' : 'Below 18'}</li>
                          )}
                          {userDetails.state && <li>State: {userDetails.state}</li>}
                          {userDetails.pinCode && <li>PIN Code: {userDetails.pinCode}</li>}
                        </ul>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <CreateScholarshipForm />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle>Statistics</CardTitle>
                  <CardDescription>Your activity on EduDAO</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-edu-light rounded-md p-3">
                        <p className="text-xs text-edu-dark/60">Created</p>
                        <p className="text-xl font-bold text-edu-primary">{createdScholarships.length}</p>
                      </div>
                      <div className="bg-edu-light rounded-md p-3">
                        <p className="text-xs text-edu-dark/60">Applied</p>
                        <p className="text-xl font-bold text-edu-primary">{appliedScholarships.length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3">
              <Tabs defaultValue="created" className="w-full">
                <TabsList className="w-full max-w-md mb-6">
                  <TabsTrigger value="created" className="flex-1">Created</TabsTrigger>
                  <TabsTrigger value="applied" className="flex-1">Applied</TabsTrigger>
                </TabsList>
                
                <TabsContent value="created" className="space-y-6">
                  {createdScholarships.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-edu-light flex items-center justify-center mb-4">
                        <Info className="h-6 w-6 text-edu-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-edu-dark mb-2">No Scholarships Created</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        You haven't created any scholarships yet. Start by creating your first scholarship proposal.
                      </p>
                      <CreateScholarshipForm />
                    </div>
                  ) : (
                    createdScholarships.map((scholarship) => (
                      <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="applied" className="space-y-6">
                  {appliedScholarships.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-edu-light flex items-center justify-center mb-4">
                        <Info className="h-6 w-6 text-edu-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-edu-dark mb-2">No Applications Yet</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        You haven't applied for any scholarships yet. Browse available scholarships and apply.
                      </p>
                      <Button className="bg-edu-primary hover:bg-edu-primary/90">
                        Browse Scholarships
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    appliedScholarships.map((scholarship) => (
                      <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-edu-dark text-white py-6 px-4 mt-12">
        <div className="container mx-auto max-w-6xl">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} EduDAO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MyDashboard;
