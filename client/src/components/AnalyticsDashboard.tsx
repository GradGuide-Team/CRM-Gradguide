'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FunnelChart } from './FunnelChart';
import { StudentAnalytics, AnalyticsDashboardProps } from '@/types/analytics';
import axiosInstance from '@/services/axiosInstance';
import endpoints from '@/services/endpoints';
import { Loader2, Users, TrendingUp, FileText, Plane } from 'lucide-react';

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const {
    data: analytics,
    isLoading,
    error,
    refetch
  } = useQuery<StudentAnalytics>({
    queryKey: ['student-analytics'],
    queryFn: async () => {
      const response = await axiosInstance.get(endpoints.getStudentAnalytics);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  const handleSegmentClick = (funnelType: string, segment: string, data: any) => {
    console.log(`Clicked ${funnelType} - ${segment}:`, data);
    // TODO: Implement drill-down functionality
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load analytics data</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Key Metrics */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Student Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Total Students</span>
            </div>
            <p className="text-2xl font-bold mt-1">{analytics.total_students}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Application Paths</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Object.keys(analytics.application_path_funnel).length}
            </p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">Countries</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Object.keys(analytics.country_distribution).length}
            </p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Plane className="h-5 w-5" />
              <span className="text-sm font-medium">Visa Approved</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {analytics.visa_process_funnel.status_distribution.Accepted?.count || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Main Funnel Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Path Funnel */}
        <FunnelChart
          title="Application Path Distribution"
          data={analytics.application_path_funnel}
          colorScheme="blue"
          onSegmentClick={(segment, data) => handleSegmentClick('application_path', segment, data)}
        />

        {/* Overall Stage Funnel */}
        <FunnelChart
          title="Student Journey Stages"
          data={analytics.overall_stage_funnel}
          colorScheme="green"
          onSegmentClick={(segment, data) => handleSegmentClick('overall_stage', segment, data)}
        />

        {/* Document Completion Funnel */}
        <FunnelChart
          title="Document Completion Status"
          data={analytics.document_completion_funnel}
          colorScheme="orange"
          onSegmentClick={(segment, data) => handleSegmentClick('document_completion', segment, data)}
        />

        {/* University Application Funnel */}
        <FunnelChart
          title="University Application Status"
          data={analytics.university_application_funnel}
          colorScheme="purple"
          onSegmentClick={(segment, data) => handleSegmentClick('university_application', segment, data)}
        />
      </div>

      {/* Visa Process Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelChart
          title="Visa Decision Status"
          data={analytics.visa_process_funnel.status_distribution}
          colorScheme="red"
          onSegmentClick={(segment, data) => handleSegmentClick('visa_status', segment, data)}
        />

        <FunnelChart
          title="Visa Process Steps"
          data={analytics.visa_process_funnel.process_steps}
          colorScheme="blue"
          onSegmentClick={(segment, data) => handleSegmentClick('visa_process', segment, data)}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelChart
          title="Country Distribution"
          data={analytics.country_distribution}
          colorScheme="green"
          onSegmentClick={(segment, data) => handleSegmentClick('country', segment, data)}
        />

        <FunnelChart
          title="Counselor Distribution"
          data={analytics.counselor_distribution}
          colorScheme="purple"
          onSegmentClick={(segment, data) => handleSegmentClick('counselor', segment, data)}
        />
      </div>

      {/* Refresh Info */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Data refreshes automatically every 30 seconds</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-blue-500 hover:text-blue-700 underline"
        >
          Refresh Now
        </button>
      </div>
    </div>
  );
};
