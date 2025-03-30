
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Scholarship, DAOContextType } from '@/types/dao';
import { fetchScholarshipsData } from '@/utils/dao-utils';
import { supabase } from '@/integrations/supabase/client';
import { useScholarshipActions } from '@/hooks/use-scholarship-actions';

const DAOContext = createContext<DAOContextType>({
  scholarships: [],
  createScholarship: async () => {},
  pendingScholarships: [],
  loading: false,
  approveScholarship: async () => {},
  fundScholarship: async () => {},
});

export const useDAO = () => useContext(DAOContext);

export const DAOProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const transformedScholarships = await fetchScholarshipsData();
      setScholarships(transformedScholarships);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load scholarships",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  // Import the scholarship actions from the hook
  const { 
    createScholarship: createScholarshipAction, 
    approveScholarship: approveScholarshipAction,
    fundScholarship: fundScholarshipAction,
    loading: actionsLoading 
  } = useScholarshipActions(scholarships, fetchScholarships);

  // Wrap the imported actions
  const createScholarship = async (
    title: string,
    description: string,
    amount: number,
    deadline: number
  ) => {
    await createScholarshipAction(title, description, amount, deadline);
  };

  const approveScholarship = async (id: string, recipientAddress: string) => {
    await approveScholarshipAction(id, recipientAddress);
  };

  const fundScholarship = async (id: string, applicationId: string) => {
    await fundScholarshipAction(id, applicationId);
  };

  const pendingScholarships = scholarships.filter(
    (s) => s.status === 'pending' && s.deadline > Date.now()
  );

  // Use the combined loading state
  const isLoading = loading || actionsLoading;

  return (
    <DAOContext.Provider
      value={{
        scholarships,
        createScholarship,
        pendingScholarships,
        loading: isLoading,
        approveScholarship,
        fundScholarship,
      }}
    >
      {children}
    </DAOContext.Provider>
  );
};
