
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';

export type ScholarshipStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type UserRole = 'student' | 'government' | 'financier' | 'regular';

export type Scholarship = {
  id: string;
  title: string;
  description: string;
  amount: number;
  creator: string;
  recipient?: string;
  status: ScholarshipStatus;
  votes: {
    for: number;
    against: number;
  };
  createdAt: number;
  deadline: number;
  voters: string[];
  applicants: string[];
};

type DAOContextType = {
  scholarships: Scholarship[];
  createScholarship: (title: string, description: string, amount: number, deadline: number) => Promise<void>;
  voteOnScholarship: (id: string, voteFor: boolean) => Promise<void>;
  applyForScholarship: (id: string) => Promise<void>;
  approveScholarship: (id: string, recipientAddress: string) => Promise<void>;
  fundScholarship: (id: string) => Promise<void>;
  myScholarships: Scholarship[];
  pendingScholarships: Scholarship[];
  loading: boolean;
  userRole: UserRole;
};

// Fixed addresses for special roles
const GOVERNMENT_ADDRESS = '0x303C226B1b66F07717D35f5E7243028950Eb1ff1';
const FINANCIER_ADDRESS = '0x388175A170A0D8fCB99FF8867C00860fCF95A7Cc';

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

// Mock data - In a real app, this would be stored on-chain or in a database
const initialScholarships: Scholarship[] = [
  {
    id: '1',
    title: 'Computer Science Excellence Scholarship',
    description: 'For outstanding students pursuing Computer Science degrees.',
    amount: 5000,
    creator: '0x1234567890123456789012345678901234567890',
    status: 'pending',
    votes: { for: 15, against: 2 },
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    deadline: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days from now
    voters: [],
    applicants: [],
  },
  {
    id: '2',
    title: 'Environmental Research Grant',
    description: 'Supporting students researching environmental sustainability.',
    amount: 3500,
    creator: '0x2345678901234567890123456789012345678901',
    status: 'approved',
    recipient: '0x3456789012345678901234567890123456789012',
    votes: { for: 25, against: 5 },
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    deadline: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    voters: [],
    applicants: ['0x3456789012345678901234567890123456789012'],
  },
];

// Save scholarships to localStorage
const saveScholarships = (scholarships: Scholarship[]) => {
  localStorage.setItem('scholarships', JSON.stringify(scholarships));
};

// Load scholarships from localStorage
const loadScholarships = (): Scholarship[] => {
  const saved = localStorage.getItem('scholarships');
  return saved ? JSON.parse(saved) : initialScholarships;
};

export const DAOProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useWallet();
  const { toast } = useToast();
  const [scholarships, setScholarships] = useState<Scholarship[]>(loadScholarships());
  const [loading, setLoading] = useState(false);

  // Determine user role based on address
  const userRole: UserRole = !address 
    ? 'regular'
    : address.toLowerCase() === GOVERNMENT_ADDRESS.toLowerCase()
    ? 'government'
    : address.toLowerCase() === FINANCIER_ADDRESS.toLowerCase()
    ? 'financier'
    : 'student';

  // Save scholarships to localStorage whenever they change
  useEffect(() => {
    saveScholarships(scholarships);
  }, [scholarships]);

  // Filter scholarships relevant to the current user
  const myScholarships = scholarships.filter(
    (s) => s.creator === address || s.recipient === address || s.applicants.includes(address || '')
  );

  // Filter pending scholarships that haven't reached deadline
  const pendingScholarships = scholarships.filter(
    (s) => s.status === 'pending' && s.deadline > Date.now()
  );

  const createScholarship = async (
    title: string,
    description: string,
    amount: number,
    deadline: number
  ) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would be a smart contract call
      const newScholarship: Scholarship = {
        id: Date.now().toString(),
        title,
        description,
        amount,
        creator: address,
        status: 'pending',
        votes: { for: 0, against: 0 },
        createdAt: Date.now(),
        deadline,
        voters: [],
        applicants: [],
      };

      setScholarships([...scholarships, newScholarship]);
      toast({
        title: "Scholarship created",
        description: "Your scholarship proposal has been submitted",
      });
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

  const voteOnScholarship = async (id: string, voteFor: boolean) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would be a smart contract call
      setScholarships(
        scholarships.map((s) => {
          if (s.id === id && !s.voters.includes(address)) {
            return {
              ...s,
              votes: {
                for: voteFor ? s.votes.for + 1 : s.votes.for,
                against: voteFor ? s.votes.against : s.votes.against + 1,
              },
              voters: [...s.voters, address],
            };
          }
          return s;
        })
      );

      toast({
        title: "Vote submitted",
        description: `You voted ${voteFor ? "for" : "against"} the scholarship`,
      });
    } catch (error) {
      console.error("Error voting on scholarship:", error);
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyForScholarship = async (id: string) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would be a smart contract call or API request
      setScholarships(
        scholarships.map((s) => {
          if (s.id === id && s.status === 'pending' && !s.applicants.includes(address)) {
            return {
              ...s,
              applicants: [...s.applicants, address],
            };
          }
          return s;
        })
      );

      toast({
        title: "Application submitted",
        description: "You have applied for this scholarship",
      });
    } catch (error) {
      console.error("Error applying for scholarship:", error);
      toast({
        title: "Error",
        description: "Failed to apply for scholarship",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveScholarship = async (id: string, recipientAddress: string) => {
    if (!address || address.toLowerCase() !== GOVERNMENT_ADDRESS.toLowerCase()) {
      toast({
        title: "Not authorized",
        description: "Only government officers can approve scholarships",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      setScholarships(
        scholarships.map((s) => {
          if (s.id === id && s.status === 'pending') {
            return {
              ...s,
              status: 'approved',
              recipient: recipientAddress,
            };
          }
          return s;
        })
      );

      toast({
        title: "Scholarship approved",
        description: "The scholarship has been approved",
      });
    } catch (error) {
      console.error("Error approving scholarship:", error);
      toast({
        title: "Error",
        description: "Failed to approve scholarship",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fundScholarship = async (id: string) => {
    if (!address || address.toLowerCase() !== FINANCIER_ADDRESS.toLowerCase()) {
      toast({
        title: "Not authorized",
        description: "Only financiers can fund scholarships",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      setScholarships(
        scholarships.map((s) => {
          if (s.id === id && s.status === 'approved') {
            return {
              ...s,
              status: 'completed',
            };
          }
          return s;
        })
      );

      toast({
        title: "Scholarship funded",
        description: "The scholarship has been funded and completed",
      });
    } catch (error) {
      console.error("Error funding scholarship:", error);
      toast({
        title: "Error",
        description: "Failed to fund scholarship",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        loading,
        userRole,
      }}
    >
      {children}
    </DAOContext.Provider>
  );
};
