import { createClient } from '@supabase/supabase-js';
import { Scholarship, ScholarshipStatus } from '@/types/dao';
import { getSupabaseClient } from '@/integrations/supabase/client';

// Mock data to use when Supabase connection fails
const MOCK_SCHOLARSHIPS = [
  {
    id: 'mock-1',
    title: 'Computer Science Scholarship',
    description: 'For students pursuing a degree in computer science',
    amount: 0.5,
    creator_address: '0x388C818CA8B9251b393131C08a736A67ccB19297',
    recipient: null,
    status: 'pending' as ScholarshipStatus,
    votes: { for: 5, against: 1 },
    created_at: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,  // 30 days from now
    voters: [],
    applicants: [],
  },
  {
    id: 'mock-2',
    title: 'Engineering Excellence',
    description: 'Supporting future engineers in their academic journey',
    amount: 0.75,
    creator_address: '0x388C818CA8B9251b393131C08a736A67ccB19297',
    recipient: '0x388175a170a0d8fcb99ff8867c00860fcf95a7cc',
    status: 'approved' as ScholarshipStatus,
    votes: { for: 8, against: 2 },
    created_at: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
    deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,  // 15 days from now
    voters: [],
    applicants: ['0x388175a170a0d8fcb99ff8867c00860fcf95a7cc'],
  },
  {
    id: 'mock-3',
    title: 'Blockchain Development',
    description: 'For students interested in blockchain technology',
    amount: 1.0,
    creator_address: '0x388C818CA8B9251b393131C08a736A67ccB19297',
    recipient: '0x388175a170a0d8fcb99ff8867c00860fcf95a7cc',
    status: 'completed' as ScholarshipStatus,
    votes: { for: 10, against: 0 },
    created_at: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    deadline: Date.now() - 15 * 24 * 60 * 60 * 1000,  // 15 days ago
    voters: [],
    applicants: ['0x388175a170a0d8fcb99ff8867c00860fcf95a7cc'],
  }
];

// Safe Supabase API call handling
export const safeSupabaseCall = async <T>(
  apiCall: () => Promise<{data: T | null, error: any}>, 
  fallbackData: T | null = null
): Promise<{data: T | null, error: any}> => {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error("Supabase API call failed:", error);
    return { data: fallbackData, error };
  }
};

export const fetchScholarshipsData = async () => {
  try {
    console.log("Fetching scholarships data...");
    const client = getSupabaseClient();
    
    // Fetch scholarships
    let scholarshipsData;
    try {
      const { data, error } = await client.from('scholarships').select('*');
      if (error) {
        console.error("Error fetching scholarships:", error);
        return MOCK_SCHOLARSHIPS;
      }
      scholarshipsData = data;
    } catch (error) {
      console.error("Error in Supabase call:", error);
      return MOCK_SCHOLARSHIPS;
    }
    
    // If no data returned, use mock data
    if (!scholarshipsData || scholarshipsData.length === 0) {
      console.log("No scholarships found, using mock data");
      return MOCK_SCHOLARSHIPS;
    }

    // Fetch applications
    let applicationsData = [];
    try {
      const { data, error } = await client.from('applications').select('*');
      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        applicationsData = data || [];
      }
    } catch (error) {
      console.error("Error in Supabase applications call:", error);
    }
    
    // Fetch votes
    let votesData = [];
    try {
      const { data, error } = await client.from('votes').select('*');
      if (error) {
        console.error("Error fetching votes:", error);
      } else {
        votesData = data || [];
      }
    } catch (error) {
      console.error("Error in Supabase votes call:", error);
    }

    const transformedScholarships: Scholarship[] = scholarshipsData.map((scholarship) => {
      const scholarshipApplications = applicationsData.filter(
        (app) => app.scholarship_id === scholarship.id
      );
      
      const scholarshipVotes = votesData.filter(
        (vote) => vote.scholarship_id === scholarship.id
      );
      
      const applicants = scholarshipApplications.map((app) => app.applicant_address);
      const voters = scholarshipVotes.map((vote) => vote.voter_address);
      
      const votesFor = scholarshipVotes.filter((vote) => vote.vote_type).length;
      const votesAgainst = scholarshipVotes.filter((vote) => !vote.vote_type).length;

      return {
        id: scholarship.id,
        title: scholarship.title,
        description: scholarship.description,
        amount: Number(scholarship.amount),
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

    return transformedScholarships;
  } catch (e) {
    console.error("Error in fetchScholarshipsData:", e);
    return MOCK_SCHOLARSHIPS; // Return mock data on any error
  }
};

// Helper function to safely fetch applications
export const fetchUserApplications = async (address: string) => {
  if (!address) return [];
  
  try {
    const client = getSupabaseClient();
    
    try {
      const { data, error } = await client.from('applications').select('*');
      
      if (error) {
        console.error("Error fetching applications:", error);
        return [];
      }
      
      // Filter applications by applicant address
      return (data || []).filter(app => app.applicant_address === address);
    } catch (error) {
      console.error("Error in Supabase call:", error);
      return [];
    }
  } catch (error) {
    console.error("Error in fetchUserApplications:", error);
    return [];
  }
};

// Helper function to safely apply for scholarship
export const applyForScholarshipSafely = async (scholarshipId: string, address: string) => {
  if (!address || !scholarshipId) {
    return { success: false, error: "Missing required information" };
  }
  
  try {
    const client = getSupabaseClient();
    
    // Fetch all applications
    let existingApps = [];
    try {
      const { data, error } = await client.from('applications').select('*');
      
      if (error) {
        console.error("Error checking existing applications:", error);
        // If we can't check, assume no existing application and try to create one
      } else {
        // Filter applications locally
        existingApps = (data || []).filter(
          app => app.scholarship_id === scholarshipId && app.applicant_address === address
        );
        
        if (existingApps && existingApps.length > 0) {
          return { success: true, error: null, existing: true };
        }
      }
    } catch (error) {
      console.error("Error in Supabase check:", error);
      // Continue to try insert
    }
    
    // Insert new application
    try {
      const insertResult = await client.from('applications').insert({
        scholarship_id: scholarshipId,
        applicant_address: address,
      });
      
      if (insertResult.error) {
        console.error("Error applying for scholarship:", insertResult.error);
        return { success: false, error: insertResult.error.message || "Failed to apply" };
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error in Supabase insert:", error);
      return { success: false, error: error.message };
    }
  } catch (error: any) {
    console.error("Error in applyForScholarshipSafely:", error);
    return { success: false, error: error.message };
  }
};
