
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

export interface DAOContextType {
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
}
