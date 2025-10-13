'use client';

import { useJobs } from "@/hooks/useJobs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function HomeownerDashboard() {
  const { jobs, isLoading, isError } = useJobs();

  if (isLoading) return <div>Loading jobs...</div>;
  if (isError) return <div className="text-red-500">Error loading jobs.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Jobs</h2>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Contractor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs?.map((job: any) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.contractor.user.email}</TableCell>
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
