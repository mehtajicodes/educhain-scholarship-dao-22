
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';
import { Scholarship, DAOContextType, UserRole } from '@/types/dao';
import { fetchScholarshipsData } from '@/utils/dao-utils';
import { useScholarshipActions } from '@/hooks/use-scholarship-actions';

const DAOContext = createContext<DAOContextType>({
  scholarships: [],
  createScholarship: async () => {},
  voteOnScholarship: async () => {},
  applyForScholarship: async () => {},
  approveScholarship: async () => {},
  fundScholarship: async () => {},
  myScholarships: [],
  pendingScholarships: [],
  loading: false,
  userRole: 'regular',
});

export const useDAO = () => useContext(DAOContext);

export const DAOProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useWallet();
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

  const {
    createScholarship,
    voteOnScholarship,
    applyForScholarship,
    approveScholarship,
    fundScholarship,
    loading: actionsLoading,
    userRole
  } = useScholarshipActions(scholarships, fetchScholarships);

  const myScholarships = scholarships.filter(
    (s) => s.creator_address === address || s.recipient === address || s.applicants.includes(address || '')
  );

  const pendingScholarships = scholarships.filter(
    (s) => s.status === 'pending' && s.deadline > Date.now()
  );

  return (
    <DAOContext.Provider
      value={{
        scholarships,
        createScholarship,
        voteOnScholarship,
        applyForScholarship,
        approveScholarship,
        fundScholarship,
        myScholarships,
        pendingScholarships,
        loading: loading || actionsLoading,
        userRole,
      }}
    >
      {children}
    </DAOContext.Provider>
  );
};
