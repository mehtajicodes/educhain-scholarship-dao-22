
import { supabase } from '@/integrations/supabase/client';
import { Scholarship, ScholarshipStatus } from '@/types/dao';

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
  }
];

export const fetchScholarshipsData = async () => {
  try {
    const { data: scholarshipsData, error } = await supabase
      .from('scholarships')
      .select('*');

    if (error) {
      console.error("Error fetching scholarships:", error);
      return MOCK_SCHOLARSHIPS; // Return mock data on error
    }

    // If no data returned, use mock data
    if (!scholarshipsData || scholarshipsData.length === 0) {
      console.log("No scholarships found, using mock data");
      return MOCK_SCHOLARSHIPS;
    }

    // Try to fetch applications
    let applicationsData = [];
    try {
      const { data, error: appError } = await supabase
        .from('applications')
        .select('*');
      
      if (appError) throw appError;
      applicationsData = data || [];
    } catch (e) {
      console.error("Error fetching applications:", e);
      // Continue with empty applications
    }

    // Try to fetch votes
    let votesData = [];
    try {
      const { data, error: votesError } = await supabase
        .from('votes')
        .select('*');
      
      if (votesError) throw votesError;
      votesData = data || [];
    } catch (e) {
      console.error("Error fetching votes:", e);
      // Continue with empty votes
    }

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
