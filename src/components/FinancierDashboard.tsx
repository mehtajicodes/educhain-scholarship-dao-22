
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDAO } from "@/contexts/DAOContext";
import { Banknote, FileText, Calendar, Check } from "lucide-react";

export function FinancierDashboard() {
  const { scholarships, fundScholarship, loading } = useDAO();
  
  // Filter scholarships that are approved but not yet funded
  const approvedScholarships = scholarships.filter(
    (s) => s.status === 'approved'
  );

  const handleFund = (scholarshipId: string) => {
    fundScholarship(scholarshipId);
  };

  // Calculate total funded amount
  const totalFunded = scholarships
    .filter(s => s.status === 'completed')
    .reduce((total, s) => total + s.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Banknote className="h-5 w-5 text-edu-primary" />
            Financier Dashboard
          </CardTitle>
          <CardDescription>
            Fund approved scholarships and track financial distributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-edu-light rounded-md p-3">
              <p className="text-xs text-edu-dark/60">Awaiting Funding</p>
              <p className="text-xl font-bold text-edu-primary">{approvedScholarships.length}</p>
            </div>
            <div className="bg-edu-light rounded-md p-3">
              <p className="text-xs text-edu-dark/60">Total Funded</p>
              <p className="text-xl font-bold text-edu-primary">
                {scholarships.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <div className="bg-edu-light rounded-md p-3">
              <p className="text-xs text-edu-dark/60">Total Amount</p>
              <p className="text-xl font-bold text-edu-primary">{totalFunded} EDU</p>
            </div>
          </div>

          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-edu-primary" />
            Approved Scholarships to Fund
          </h3>

          {approvedScholarships.length === 0 ? (
            <div className="bg-gray-50 rounded-md p-6 text-center text-gray-500">
              No scholarships awaiting funding
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scholarship</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Date Approved</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedScholarships.map((scholarship) => (
                    <TableRow key={scholarship.id}>
                      <TableCell className="font-medium">{scholarship.title}</TableCell>
                      <TableCell>{scholarship.amount} EDU</TableCell>
                      <TableCell className="font-mono text-xs">
                        {scholarship.recipient?.slice(0, 6)}...{scholarship.recipient?.slice(-4)}
                      </TableCell>
                      <TableCell>{new Date(scholarship.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          className="bg-edu-primary hover:bg-edu-primary/90"
                          onClick={() => handleFund(scholarship.id)}
                          disabled={loading}
                        >
                          <Banknote className="mr-1 h-4 w-4" />
                          Fund
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <h3 className="text-lg font-medium mt-8 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-edu-primary" />
            Funding History
          </h3>

          {scholarships.filter(s => s.status === 'completed').length === 0 ? (
            <div className="bg-gray-50 rounded-md p-6 text-center text-gray-500">
              No funding history yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scholarship</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Date Funded</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarships
                    .filter(s => s.status === 'completed')
                    .map((scholarship) => (
                      <TableRow key={scholarship.id}>
                        <TableCell className="font-medium">{scholarship.title}</TableCell>
                        <TableCell>{scholarship.amount} EDU</TableCell>
                        <TableCell className="font-mono text-xs">
                          {scholarship.recipient?.slice(0, 6)}...{scholarship.recipient?.slice(-4)}
                        </TableCell>
                        <TableCell>{new Date(scholarship.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="mr-1 h-3 w-3" />
                            Completed
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
