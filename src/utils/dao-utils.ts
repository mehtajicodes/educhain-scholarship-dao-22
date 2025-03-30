
import { supabase } from '@/integrations/supabase/client';
import { Scholarship } from '@/types/dao';

export const fetchScholarshipsData = async () => {
  const { data: scholarshipsData, error } = await supabase
    .from('scholarships')
    .select('*');

  if (error) throw error;

  const { data: applicationsData, error: applicationsError } = await supabase
    .from('applications')
    .select('*');

  if (applicationsError) throw applicationsError;

  const { data: votesData, error: votesError } = await supabase
    .from('votes')
    .select('*');

  if (votesError) throw votesError;

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
      status: scholarship.status,
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
};
