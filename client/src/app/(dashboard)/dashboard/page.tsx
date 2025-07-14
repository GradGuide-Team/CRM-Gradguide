// "use client"
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useStudents } from "@/hooks/useStudents";
// import { Users, FileText, Tickets, Plane, TrendingUp, Clock, CheckCircle, Globe } from "lucide-react";

// interface DashboardProps {
//   onSectionChange: (section: string) => void;
// }

// export default function Dashboard({ onSectionChange }: DashboardProps) {
//   const { dashboardStats, students, isLoading } = useStudents();

//   if (isLoading) {
//     return (
//       <div className="p-6">
//         <div className="animate-pulse space-y-6">
//           <div className="h-8 bg-gray-200 rounded w-1/3"></div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const recentActivities = students.slice(0, 5).map((student: any) => ({
//     id: student.id,
//     studentName: student.name || 'Unknown Student',
//     action: `Stage: ${student.currentStage || 'document'}`,
//     timestamp: student.updatedAt || new Date(),
//     type: student.currentStage || 'document'
//   }));

//   return (
//     <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Dashboard Overview</h1>
//         <p className="text-gray-600 text-lg">Monitor student applications and track progress across all stages</p>
//       </div>
      
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//         <Card className="hover-lift shadow-elegant border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-blue-100 mb-1">Total Students</p>
//                 <p className="text-3xl font-bold text-white">{dashboardStats.totalStudents}</p>
//               </div>
//               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
//                 <Users className="h-7 w-7 text-white" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="hover-lift shadow-elegant border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-orange-100 mb-1">In Application</p>
//                 <p className="text-3xl font-bold text-white">{dashboardStats.applicationStage}</p>
//               </div>
//               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
//                 <FileText className="h-7 w-7 text-white" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="hover-lift shadow-elegant border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-green-100 mb-1">Visa Stage</p>
//                 <p className="text-3xl font-bold text-white">{dashboardStats.visaStage}</p>
//               </div>
//               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
//                 <Tickets className="h-7 w-7 text-white" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="hover-lift shadow-elegant border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-purple-100 mb-1">Departed</p>
//                 <p className="text-3xl font-bold text-white">{dashboardStats.departed}</p>
//               </div>
//               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
//                 <Plane className="h-7 w-7 text-white" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Application Path Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         <Card className="hover-lift shadow-elegant border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-emerald-100 mb-1">SI Applications</p>
//                 <p className="text-3xl font-bold text-white">{dashboardStats.siApplications}</p>
//               </div>
//               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
//                 <Globe className="h-7 w-7 text-white" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="hover-lift shadow-elegant border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-indigo-100 mb-1">Eduwise Applications</p>
//                 <p className="text-3xl font-bold text-white">{dashboardStats.eduwiseApplications}</p>
//               </div>
//               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
//                 <Users className="h-7 w-7 text-white" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
      
//       {/* Recent Students & Quick Actions */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Recent Student Activity</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {recentActivities.length === 0 ? (
//               <p className="text-gray-500 text-center py-8">No recent activity</p>
//             ) : (
//               <div className="space-y-4">
//                 {recentActivities.map((activity) => (
//                   <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
//                     <div className="flex items-center">
//                       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
//                         <Users className="h-4 w-4 text-primary" />
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-900">{activity.studentName}</p>
//                         <p className="text-sm text-gray-600">{activity.action}</p>
//                       </div>
//                     </div>
//                     <span className="text-xs text-gray-500">
//                       {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Recent'}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <Button 
//               onClick={() => onSectionChange('students')} 
//               className="w-full bg-primary hover:bg-primary/90 text-white"
//             >
//               <Users className="w-4 h-4 mr-2" />
//               Add New Student
//             </Button>
//             <Button variant="outline" className="w-full">
//               <FileText className="w-4 h-4 mr-2" />
//               Export Report
//             </Button>
//             <Button 
//               variant="outline" 
//               className="w-full"
//               onClick={() => onSectionChange('funnel')}
//             >
//               <TrendingUp className="w-4 h-4 mr-2" />
//               View Analytics
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
