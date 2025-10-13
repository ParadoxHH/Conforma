'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

// --- Placeholder Dashboards ---
const AdminDashboard = () => <div className="text-center"><h2 className="text-2xl font-bold">Admin Dashboard</h2><p>Manage users, jobs, and disputes.</p></div>;
const ContractorDashboard = () => <div className="text-center"><h2 className="text-2xl font-bold">Contractor Dashboard</h2><p>Create jobs and manage your milestones.</p></div>;
const HomeownerDashboard = () => <div className="text-center"><h2 className="text-2xl font-bold">Homeowner Dashboard</h2><p>View your jobs and approve milestones.</p></div>;
const LoadingDashboard = () => <div className="text-center"><p>Loading dashboard...</p></div>;
const ErrorDashboard = () => <div className="text-center"><p className="text-red-500">Could not load dashboard. Please log in.</p></div>;


export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // This assumes the user has logged in and a token is in localStorage
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        setError(true);
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const renderDashboard = () => {
    if (loading) return <LoadingDashboard />;
    if (error || !user) return <ErrorDashboard />;

    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'CONTRACTOR':
        return <ContractorDashboard />;
      case 'HOMEOWNER':
        return <HomeownerDashboard />;
      default:
        return <ErrorDashboard />;
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="space-y-4 pt-20">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="mt-8">
          {renderDashboard()}
        </div>
      </div>
    </div>
  );
}
