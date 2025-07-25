'use client';

import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { withAuth } from '@/wrapper/authWrapper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AnalyticsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-gray-50 min-h-screen w-full p-6">
        <AnalyticsDashboard />
      </div>
    </QueryClientProvider>
  );
}

export default withAuth(AnalyticsPage);
