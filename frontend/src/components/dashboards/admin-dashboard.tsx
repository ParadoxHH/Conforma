'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// --- API Hooks ---
const useAllUsers = () => useQuery({ queryKey: ['allUsers'], queryFn: async () => (await api.get('/admin/users')).data });
const useAllJobs = () => useQuery({ queryKey: ['allJobs'], queryFn: async () => (await api.get('/admin/jobs')).data });
const useAllDisputes = () => useQuery({ queryKey: ['allDisputes'], queryFn: async () => (await api.get('/admin/disputes')).data });


// --- Dashboard Component ---
export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { data: jobs, isLoading: jobsLoading } = useAllJobs();
  const { data: disputes, isLoading: disputesLoading } = useAllDisputes();

  return (
    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="disputes">Disputes</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <Card>
          <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
          <CardContent>
            {usersLoading ? <p>Loading users...</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users?.map((user: any) => (
                    <TableRow key={user.id}><TableCell>{user.email}</TableCell><TableCell>{user.role}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="jobs">
        <Card>
          <CardHeader><CardTitle>All Jobs</CardTitle></CardHeader>
          <CardContent>
            {/* Similar table for jobs */}
            {jobsLoading ? <p>Loading jobs...</p> : <p>{jobs?.length || 0} jobs found.</p>}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="disputes">
        <Card>
          <CardHeader><CardTitle>All Disputes</CardTitle></CardHeader>
          <CardContent>
            {/* Similar table for disputes */}
            {disputesLoading ? <p>Loading disputes...</p> : <p>{disputes?.length || 0} disputes found.</p>}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
