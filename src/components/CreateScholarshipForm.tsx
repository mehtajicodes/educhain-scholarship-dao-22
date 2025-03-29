
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDAO } from "@/contexts/DAOContext";
import { useToast } from "@/hooks/use-toast";
import { useAnonAadhaarContext } from "@/contexts/AnonAadhaarContext";
import { useWallet } from "@/hooks/use-wallet";
import { Plus, Shield } from "lucide-react";

export function CreateScholarshipForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  
  const { createScholarship, loading, userRole } = useDAO();
  const { toast } = useToast();
  const { isVerified } = useAnonAadhaarContext();
  const { isConnected } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !amount || !durationDays) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    const amountValue = parseFloat(amount);
    const durationValue = parseInt(durationDays);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(durationValue) || durationValue <= 0) {
      toast({
        title: "Invalid duration",
        description: "Please enter a valid duration in days",
        variant: "destructive",
      });
      return;
    }
    
    const deadline = Date.now() + durationValue * 24 * 60 * 60 * 1000;
    
    try {
      await createScholarship(title, description, amountValue, deadline);
      setTitle("");
      setDescription("");
      setAmount("");
      setDurationDays("30");
      setOpen(false);
    } catch (error) {
      console.error("Error creating scholarship:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-edu-primary hover:bg-edu-primary/90"
          disabled={!isConnected || (userRole === 'student' && !isVerified) || userRole !== 'government'}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Scholarship
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Scholarship</DialogTitle>
          <DialogDescription>
            Fill in the details for your new scholarship proposal. The community will vote on your proposal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Computer Science Excellence Scholarship"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your scholarship, who it's for, and why it matters"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (EDU)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  min="0"
                  step="100"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="365"
                />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800 flex items-start mt-2">
              <Shield className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Important</p>
                <p>
                  This will create an on-chain proposal that cannot be modified once submitted.
                  Make sure all details are correct.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Scholarship"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
