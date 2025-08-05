/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/components/AnalyticsDashboard.tsx
"use client";

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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-6 text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">Student Analytics Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">Total Students</span>
            </div>
            <p className="text-2xl font-bold mt-1">{analytics.total_students.toLocaleString()}</p>
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Application Path Funnel */}
        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <FunnelChart
            title="Application Path Distribution"
            data={analytics.application_path_funnel}
            colorScheme="blue"
            onSegmentClick={(segment, data) => handleSegmentClick('application_path', segment, data)}
            height={350}
          />
        </div>

        {/* Overall Stage Funnel */}
        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <FunnelChart
            title="Student Journey Stages"
            data={analytics.overall_stage_funnel}
            colorScheme="green"
            onSegmentClick={(segment, data) => handleSegmentClick('overall_stage', segment, data)}
            height={350}
          />
        </div>

        {/* Document Completion Funnel */}
        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <FunnelChart
            title="Document Completion Status"
            data={analytics.document_completion_funnel}
            colorScheme="orange"
            onSegmentClick={(segment, data) => handleSegmentClick('document_completion', segment, data)}
            height={350}
          />
        </div>

        {/* University Application Funnel */}
        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <FunnelChart
            title="University Application Status"
            data={analytics.university_application_funnel}
            colorScheme="purple"
            onSegmentClick={(segment, data) => handleSegmentClick('university_application', segment, data)}
            height={350}
          />
        </div>
      </div>

      {/* Visa Process Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <FunnelChart
            title="Visa Decision Status"
            data={analytics.visa_process_funnel.status_distribution}
            colorScheme="red"
            onSegmentClick={(segment, data) => handleSegmentClick('visa_status', segment, data)}
            height={350}
          />
        </div>

        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <FunnelChart
            title="Visa Process Steps"
            data={analytics.visa_process_funnel.process_steps}
            colorScheme="blue"
            onSegmentClick={(segment, data) => handleSegmentClick('visa_process', segment, data)}
            height={350}
          />
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <FunnelChart
            title="Country Distribution"
            data={analytics.country_distribution}
            colorScheme="green"
            onSegmentClick={(segment, data) => handleSegmentClick('country', segment, data)}
            height={350}
          />
        </div>

        <div className="transform transition-all duration-200 hover:scale-[1.02]">
          <FunnelChart
            title="Counselor Distribution"
            data={analytics.counselor_distribution}
            colorScheme="purple"
            onSegmentClick={(segment, data) => handleSegmentClick('counselor', segment, data)}
            height={350}
          />
        </div>
      </div>

      {/* Refresh Info */}
      <div className="text-center text-sm text-gray-500 mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="mb-2">Data refreshes automatically every 30 seconds</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Now
        </button>
      </div>
    </div>
  );
};
