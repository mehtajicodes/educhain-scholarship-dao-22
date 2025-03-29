
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type ScholarshipStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type UserRole = 'student' | 'government' | 'financier' | 'regular';

export type Scholarship = {
  id: string;
  title: string;
  description: string;
  amount: number;
  creator_address: string;
  recipient?: string;
  status: ScholarshipStatus;
  votes: {
    for: number;
    against: number;
  };
  created_at: number;
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
  fundScholarship: (id: string, applicationId: string) => Promise<void>;
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

export const DAOProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useWallet();
  const { toast } = useToast();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine user role based on address
  const userRole: UserRole = !address 
    ? 'regular'
    : address.toLowerCase() === GOVERNMENT_ADDRESS.toLowerCase()
    ? 'government'
    : address.toLowerCase() === FINANCIER_ADDRESS.toLowerCase()
    ? 'financier'
    : 'student';

  // Load scholarships from Supabase
  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      // Fetch scholarships from Supabase
      const { data: scholarshipsData, error } = await supabase
        .from('scholarships')
        .select('*');

      if (error) throw error;

      // Fetch applications for each scholarship
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*');

      if (applicationsError) throw applicationsError;

      // Fetch votes for each scholarship
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*');

      if (votesError) throw votesError;

      // Transform data to match our Scholarship type
      const transformedScholarships: Scholarship[] = scholarshipsData.map((scholarship) => {
        const scholarshipApplications = applicationsData?.filter(
          (app) => app.scholarship_id === scholarship.id
        ) || [];
        
        const scholarshipVotes = votesData?.filter(
          (vote) => vote.scholarship_id === scholarship.id
        ) || [];
        
        const applicants = scholarshipApplications.map((app) => app.applicant_address);
        const voters = scholarshipVotes.map((vote) => vote.voter_address);
        
        const votesFor = scholarshipVotes.filter((vote) => vote.vote_type).length;
        const votesAgainst = scholarshipVotes.filter((vote) => !vote.vote_type).length;

        return {
          id: scholarship.id,
          title: scholarship.title,
          description: scholarship.description,
          amount: parseFloat(scholarship.amount),
          creator_address: scholarship.creator_address,
          recipient: scholarshipApplications.find(app => app.status === 'approved')?.applicant_address,
          status: scholarship.status as ScholarshipStatus,
          votes: {
            for: votesFor,
            against: votesAgainst,
          },
          created_at: new Date(scholarship.created_at).getTime(),
          deadline: new Date(scholarship.deadline).getTime(),
          voters,
          applicants,
        };
      });

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

  // Filter scholarships relevant to the current user
  const myScholarships = scholarships.filter(
    (s) => s.creator_address === address || s.recipient === address || s.applicants.includes(address || '')
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

    if (userRole !== 'government') {
      toast({
        title: "Not authorized",
        description: "Only government officers can create scholarships",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Insert new scholarship into Supabase
      const { data, error } = await supabase
        .from('scholarships')
        .insert([
          {
            title,
            description,
            amount,
            creator_address: address,
            deadline: new Date(deadline).toISOString(),
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Scholarship created",
        description: "Your scholarship proposal has been submitted",
      });

      // Refresh scholarships
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
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('*')
        .eq('scholarship_id', id)
        .eq('voter_address', address);

      if (checkError) throw checkError;

      if (existingVote && existingVote.length > 0) {
        toast({
          title: "Already voted",
          description: "You have already voted on this scholarship",
          variant: "destructive",
        });
        return;
      }

      // Insert vote into Supabase
      const { error } = await supabase
        .from('votes')
        .insert([
          {
            scholarship_id: id,
            voter_address: address,
            vote_type: voteFor,
          }
        ]);

      if (error) throw error;

      // Update scholarship vote count
      const scholarshipToUpdate = scholarships.find(s => s.id === id);
      if (scholarshipToUpdate) {
        const votesFor = voteFor ? scholarshipToUpdate.votes.for + 1 : scholarshipToUpdate.votes.for;
        const votesAgainst = voteFor ? scholarshipToUpdate.votes.against : scholarshipToUpdate.votes.against + 1;

        const { error: updateError } = await supabase
          .from('scholarships')
          .update({
            votes_for: votesFor,
            votes_against: votesAgainst,
          })
          .eq('id', id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Vote submitted",
        description: `You voted ${voteFor ? "for" : "against"} the scholarship`,
      });

      // Refresh scholarships
      fetchScholarships();
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
      // Check if already applied
      const { data: existingApplication, error: checkError } = await supabase
        .from('applications')
        .select('*')
        .eq('scholarship_id', id)
        .eq('applicant_address', address);

      if (checkError) throw checkError;

      if (existingApplication && existingApplication.length > 0) {
        toast({
          title: "Already applied",
          description: "You have already applied for this scholarship",
          variant: "destructive",
        });
        return;
      }

      // Insert application into Supabase
      const { error } = await supabase
        .from('applications')
        .insert([
          {
            scholarship_id: id,
            applicant_address: address,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Application submitted",
        description: "You have applied for this scholarship",
      });

      // Refresh scholarships
      fetchScholarships();
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
      // Find the application to approve
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('scholarship_id', id)
        .eq('applicant_address', recipientAddress);

      if (appError) throw appError;

      if (!applications || applications.length === 0) {
        toast({
          title: "Error",
          description: "Application not found",
          variant: "destructive",
        });
        return;
      }

      // Update application status
      const { error: updateAppError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applications[0].id);

      if (updateAppError) throw updateAppError;

      // Update scholarship status
      const { error: updateScholarshipError } = await supabase
        .from('scholarships')
        .update({ status: 'approved' })
        .eq('id', id);

      if (updateScholarshipError) throw updateScholarshipError;

      toast({
        title: "Scholarship approved",
        description: "The scholarship has been approved",
      });

      // Refresh scholarships
      fetchScholarships();
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

  const fundScholarship = async (id: string, applicationId: string) => {
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
      // Find the approved application
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .eq('status', 'approved');

      if (appError) throw appError;

      if (!applications || applications.length === 0) {
        toast({
          title: "Error",
          description: "Approved application not found",
          variant: "destructive",
        });
        return;
      }

      // Find the scholarship
      const { data: scholarshipData, error: scholarshipError } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved');

      if (scholarshipError) throw scholarshipError;

      if (!scholarshipData || scholarshipData.length === 0) {
        toast({
          title: "Error",
          description: "Approved scholarship not found",
          variant: "destructive",
        });
        return;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            scholarship_id: id,
            application_id: applicationId,
            financier_address: address,
            recipient_address: applications[0].applicant_address,
            amount: scholarshipData[0].amount,
          }
        ]);

      if (transactionError) throw transactionError;

      // Call MetaMask to make payment (this would be implemented with actual blockchain integration)
      // For now, we'll simulate the transaction succeeding

      // Update scholarship status to completed
      const { error: updateError } = await supabase
        .from('scholarships')
        .update({ status: 'completed' })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "Scholarship funded",
        description: "The scholarship has been funded and completed",
      });

      // Refresh scholarships
      fetchScholarships();
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
