// Analytics data types for funnel views

export interface FunnelSegment {
  count: number;
  percentage: number;
}

export interface FunnelData {
  [key: string]: FunnelSegment;
}

export interface VisaProcessFunnel {
  status_distribution: FunnelData;
  process_steps: FunnelData;
}

export interface StudentAnalytics {
  total_students: number;
  application_path_funnel: FunnelData;
  overall_stage_funnel: FunnelData;
  document_completion_funnel: FunnelData;
  university_application_funnel: FunnelData;
  visa_process_funnel: VisaProcessFunnel;
  country_distribution: FunnelData;
  counselor_distribution: FunnelData;
}

export interface FunnelChartProps {
  title: string;
  data: FunnelData;
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  showPercentages?: boolean;
  onSegmentClick?: (segment: string, data: FunnelSegment) => void;
  height?: number;
}

export interface AnalyticsDashboardProps {
  className?: string;
}
