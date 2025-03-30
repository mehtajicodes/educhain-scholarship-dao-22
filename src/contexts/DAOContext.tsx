
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Scholarship, DAOContextType } from '@/types/dao';
import { fetchScholarshipsData } from '@/utils/dao-utils';
import { supabase } from '@/integrations/supabase/client';

const DAOContext = createContext<DAOContextType>({
  scholarships: [],
  createScholarship: async () => {},
  pendingScholarships: [],
  loading: false,
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

  const createScholarship = async (
    title: string,
    description: string,
    amount: number,
    deadline: number
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('scholarships')
        .insert({
          title,
          description,
          amount,
          creator_address: "0x303C226B1b66F07717D35f5E7243028950Eb1ff1", // Default to government address
          deadline: new Date(deadline).toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Scholarship created",
        description: "Your scholarship proposal has been submitted",
      });

      fetchScholarships();
    } catch (error) {
      console.error("Error creating scholarship:", error);
      toast({
        title: "Error",
        description: "Failed to create scholarship",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingScholarships = scholarships.filter(
    (s) => s.status === 'pending' && s.deadline > Date.now()
  );

  return (
    <DAOContext.Provider
      value={{
        scholarships,
        createScholarship,
        pendingScholarships,
        loading,
      }}
    >
      {children}
    </DAOContext.Provider>
  );
};
