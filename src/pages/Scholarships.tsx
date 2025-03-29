
import { Header } from "@/components/Header";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { CreateScholarshipForm } from "@/components/CreateScholarshipForm";
import { AnonAadhaarLogin } from "@/components/AnonAadhaarLogin";
import { useDAO } from "@/contexts/DAOContext";
import { useAnonAadhaarContext } from "@/contexts/AnonAadhaarContext";
import { useWallet } from "@/hooks/use-wallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Info } from "lucide-react";

const Scholarships = () => {
  const { scholarships, pendingScholarships } = useDAO();
  const { isVerified } = useAnonAadhaarContext();
  const { isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredScholarships = scholarships.filter(
    (scholarship) =>
      scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-edu-dark">Scholarships</h1>
            <p className="text-gray-600 mt-1">Browse, vote on, and apply for scholarships</p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search scholarships..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <CreateScholarshipForm />
          </div>
        </div>
        
        {!isConnected || !isVerified ? (
          <div className="max-w-md mx-auto my-8">
            <div className="bg-yellow-50 p-4 rounded-lg mb-6 flex items-start gap-3 text-yellow-800">
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Verification Required</p>
                <p className="mt-1 text-sm">
                  You need to connect your wallet and verify your identity with Aadhaar to interact with scholarships.
                </p>
              </div>
            </div>
            <AnonAadhaarLogin />
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-6">
              {pendingScholarships.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No active scholarships found</p>
                </div>
              ) : (
                pendingScholarships
                  .filter((s) => s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                s.description.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((scholarship) => (
                    <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                  ))
              )}
            </TabsContent>
            
            <TabsContent value="all" className="space-y-6">
              {filteredScholarships.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No scholarships found</p>
                </div>
              ) : (
                filteredScholarships.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-6">
              {scholarships
                .filter((s) => s.status === "completed" && 
                             (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              s.description.toLowerCase().includes(searchTerm.toLowerCase())))
                .length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No completed scholarships found</p>
                </div>
              ) : (
                scholarships
                  .filter((s) => s.status === "completed" && 
                               (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                s.description.toLowerCase().includes(searchTerm.toLowerCase())))
                  .map((scholarship) => (
                    <ScholarshipCard key={scholarship.id} scholarship={scholarship} showActions={false} />
                  ))
              )}
            </TabsContent>
          </Tabs>
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

export default Scholarships;
