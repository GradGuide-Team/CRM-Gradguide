'use client';

import React from 'react';
import { FunnelChart } from '@/components/FunnelChart';
import { FunnelData } from '@/types/analytics';

const demoData: FunnelData = {
  'Application Submitted': { count: 1250, percentage: 100 },
  'Documents Verified': { count: 1100, percentage: 88 },
  'University Applied': { count: 950, percentage: 76 },
  'Offer Received': { count: 720, percentage: 57.6 },
  'Visa Applied': { count: 650, percentage: 52 },
  'Visa Approved': { count: 580, percentage: 46.4 },
  'Travel Completed': { count: 520, percentage: 41.6 }
};

const smallSegmentData: FunnelData = {
  'Major Segment': { count: 1000, percentage: 95.2 },
  'Minor Segment': { count: 30, percentage: 2.9 },
  'Tiny Segment': { count: 20, percentage: 1.9 }
};

const colorSchemes = ['blue', 'green', 'purple', 'orange', 'red'] as const;

export default function FunnelImprovementsDemo() {
  const handleSegmentClick = (segment: string, data: any) => {
    console.log(`Clicked: ${segment}`, data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Funnel Chart Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Interactive funnel charts with improved hover states and accessibility features.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <FunnelChart
            title="Student Journey Funnel"
            data={demoData}
            colorScheme="blue"
            onSegmentClick={handleSegmentClick}
            height={400}
          />

          <FunnelChart
            title="Small Segments Example"
            data={smallSegmentData}
            colorScheme="green"
            onSegmentClick={handleSegmentClick}
            height={400}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Color Schemes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {colorSchemes.map((scheme) => (
              <FunnelChart
                key={scheme}
                title={`${scheme.charAt(0).toUpperCase() + scheme.slice(1)} Theme`}
                data={{
                  'High': { count: 100, percentage: 50 },
                  'Medium': { count: 75, percentage: 37.5 },
                  'Low': { count: 25, percentage: 12.5 }
                }}
                colorScheme={scheme}
                onSegmentClick={handleSegmentClick}
                height={280}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
