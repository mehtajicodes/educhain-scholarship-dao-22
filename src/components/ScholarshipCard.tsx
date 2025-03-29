
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Scholarship, useDAO } from "@/contexts/DAOContext";
import { useWallet } from "@/hooks/use-wallet";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Check, Info, Users, X } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAnonAadhaarContext } from "@/contexts/AnonAadhaarContext";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  showActions?: boolean;
}

export function ScholarshipCard({ scholarship, showActions = true }: ScholarshipCardProps) {
  const { voteOnScholarship, applyForScholarship, loading } = useDAO();
  const { address } = useWallet();
  const { isVerified } = useAnonAadhaarContext();
  
  const hasVoted = scholarship.voters.includes(address || '');
  const isCreator = scholarship.creator === address;
  const isApplicant = scholarship.recipient === address;
  const totalVotes = scholarship.votes.for + scholarship.votes.against;
  const approvalPercentage = totalVotes > 0 
    ? Math.round((scholarship.votes.for / totalVotes) * 100) 
    : 0;
  
  const timeLeft = scholarship.deadline > Date.now() 
    ? formatDistanceToNow(scholarship.deadline, { addSuffix: true }) 
    : 'Expired';
  
  const getStatusBadge = () => {
    switch(scholarship.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden border-t-4 border-t-edu-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{scholarship.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="flex justify-between items-center">
          <span>Created {formatDistanceToNow(scholarship.createdAt, { addSuffix: true })}</span>
          <span className="font-medium text-edu-primary">
            {scholarship.amount} EDU
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{scholarship.description}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{totalVotes} votes</span>
            </span>
            <span className="text-gray-600">Deadline: {timeLeft}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span>Approval</span>
              <span>{approvalPercentage}%</span>
            </div>
            <Progress value={approvalPercentage} className="h-2" />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-green-600">For: {scholarship.votes.for}</span>
            <span className="text-red-600">Against: {scholarship.votes.against}</span>
          </div>
        </div>
      </CardContent>
      
      {showActions && scholarship.status === 'pending' && (
        <CardFooter className="flex flex-col gap-2 pt-0">
          <div className="w-full h-px bg-gray-100 mb-2"></div>
          
          {!isCreator && !isApplicant && !hasVoted && (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={() => voteOnScholarship(scholarship.id, true)}
                disabled={loading || !isVerified}
              >
                <Check className="mr-2 h-4 w-4" />
                Vote For
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => voteOnScholarship(scholarship.id, false)}
                disabled={loading || !isVerified}
              >
                <X className="mr-2 h-4 w-4" />
                Vote Against
              </Button>
            </div>
          )}
          
          {isCreator && (
            <div className="text-sm text-center text-gray-500 flex items-center justify-center gap-1 mt-1">
              <Info className="h-4 w-4" />
              <span>You created this scholarship</span>
            </div>
          )}
          
          {hasVoted && !isCreator && !isApplicant && (
            <div className="text-sm text-center text-gray-500 flex items-center justify-center gap-1 mt-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>You have voted on this scholarship</span>
            </div>
          )}
          
          {!isCreator && !isApplicant && scholarship.recipient === undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="default"
                      className="w-full mt-2 bg-edu-secondary hover:bg-edu-secondary/90"
                      onClick={() => applyForScholarship(scholarship.id)}
                      disabled={loading || !isVerified}
                    >
                      Apply for Scholarship
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isVerified && (
                  <TooltipContent>
                    <p>You need to verify your identity with Aadhaar first</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isApplicant && (
            <div className="text-sm text-center text-blue-500 flex items-center justify-center gap-1 mt-1">
              <Check className="h-4 w-4" />
              <span>You have applied for this scholarship</span>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
