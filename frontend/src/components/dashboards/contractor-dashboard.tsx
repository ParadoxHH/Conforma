'use client';

import { useJobs } from "@/hooks/useJobs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

// --- Create Job Form ---
const CreateJobForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [homeownerEmail, setHomeownerEmail] = useState(''); // We'll need a way to get homeownerId
  
  // This is a simplified milestone setup. A real form would be more dynamic.
  const [milestone1Title, setMilestone1Title] = useState('');
  const [milestone1Price, setMilestone1Price] = useState(0);

  const createJobMutation = useMutation({
    mutationFn: (newJob: any) => api.post('/jobs', newJob),
    onSuccess: () => {
      toast.success('Job created successfully!');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create job.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd need to look up the homeowner's ID from their email.
    // This is a placeholder and will fail without backend changes to support email lookup.
    const newJob = {
      title,
      description,
      totalPrice,
      homeownerEmail, // This needs to be resolved to an ID
      milestones: [{ title: milestone1Title, price: milestone1Price }]
    };
    createJobMutation.mutate(newJob);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Job Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      {/* Add other form fields here: description, totalPrice, homeownerEmail, milestones */}
      <Button type="submit" disabled={createJobMutation.isPending}>
        {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
      </Button>
    </form>
  );
};


// --- Main Dashboard Component ---
export default function ContractorDashboard() {
  const { jobs, isLoading, isError } = useJobs();
  const [open, setOpen] = useState(false);

  if (isLoading) return <div>Loading jobs...</div>;
  if (isError) return <div className="text-red-500">Error loading jobs.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Jobs</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Job</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Job</DialogTitle>
              <DialogDescription>
                Fill out the details below to create a new job and invite a homeowner.
              </DialogDescription>
            </DialogHeader>
            <CreateJobForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Homeowner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs?.map((job: any) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.homeowner.user.email}</TableCell>
                  <TableCell>
                    <Badge>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${job.totalPrice.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
