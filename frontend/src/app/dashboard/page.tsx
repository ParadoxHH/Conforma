'use client';

import { useUser } from '@/hooks/useUser';
import AdminDashboard from '@/components/dashboards/admin-dashboard';
import ContractorDashboard from '@/components/dashboards/contractor-dashboard';
import HomeownerDashboard from '@/components/dashboards/homeowner-dashboard';

const LoadingDashboard = () => <div className="text-center"><p>Loading dashboard...</p></div>;
const ErrorDashboard = () => <div className="text-center"><p className="text-red-500">Could not load dashboard. Please log in.</p></div>;


export default function DashboardPage() {
  const { user, isLoading, isError } = useUser();

  const renderDashboard = () => {
    if (isLoading) return <LoadingDashboard />;
    if (isError || !user) return <ErrorDashboard />;

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
