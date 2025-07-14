// import { useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useStudents } from "@/hooks/useStudents";
// import { Student } from "@/types";
// import { Users, ExternalLink, Calendar, Check, Clock, X, Edit } from "lucide-react";

// interface StudentModalProps {
//   student: Student;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function StudentModal({ student, isOpen, onClose }: StudentModalProps) {
//   const { updateStudent, isUpdatingStudent } = useStudents();
//   const [localStudent, setLocalStudent] = useState(student);
//   const [isEditingCounselor, setIsEditingCounselor] = useState(false);

//   const updateDocumentStatus = (document: keyof typeof student.documents, status: boolean) => {
//     const updatedDocuments = { ...localStudent.documents, [document]: status };
//     setLocalStudent({ ...localStudent, documents: updatedDocuments });
//     updateStudent({ 
//       id: student.id, 
//       updates: { documents: updatedDocuments }
//     });
//   };

//   const updateApplicationProgress = (field: string, value: any) => {
//     const updatedProgress = { ...localStudent.applicationProgress, [field]: value };
//     setLocalStudent({ ...localStudent, applicationProgress: updatedProgress });
//     updateStudent({ 
//       id: student.id, 
//       updates: { applicationProgress: updatedProgress }
//     });
//   };

//   const updateVisaProgress = (field: string, value: any) => {
//     const updatedVisa = { ...localStudent.visaProgress, [field]: value };
//     setLocalStudent({ ...localStudent, visaProgress: updatedVisa });
//     updateStudent({
//       id: student.id,
//       updates: { visaProgress: updatedVisa }
//     });
//   };

//   const updateCounselor = (counselor: string) => {
//     setLocalStudent({ ...localStudent, counselor });
//     updateStudent({
//       id: student.id,
//       updates: { counselor }
//     });
//     setIsEditingCounselor(false);
//   };

//   const getProgressPercentage = () => {
//     let progress = 0;
    
//     // Document stage (25%)
//     const documentsCompleted = Object.values(localStudent.documents || {}).filter(Boolean).length;
//     progress += (documentsCompleted / 6) * 25;
    
//     // Application stage (35%)
//     if (localStudent.currentStage === 'application' || localStudent.currentStage === 'visa' || localStudent.currentStage === 'departed') {
//       progress += 35;
//     }
    
//     // Visa stage (30%)
//     if (localStudent.currentStage === 'visa' || localStudent.currentStage === 'departed') {
//       progress += 30;
//     }
    
//     // Departed (10%)
//     if (localStudent.currentStage === 'departed') {
//       progress += 10;
//     }
    
//     return Math.min(progress, 100);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
//         <DialogHeader className="border-b border-gray-200 pb-4">
//           <div className="flex items-center">
//             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
//               <Users className="h-6 w-6 text-primary" />
//             </div>
//             <div>
//               <DialogTitle className="text-xl">{localStudent.name}</DialogTitle>
//               <p className="text-gray-600">{localStudent.email}</p>
//             </div>
//           </div>
//         </DialogHeader>
        
//         <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
//           <TabsList className="grid w-full grid-cols-5">
//             <TabsTrigger value="overview">Overview</TabsTrigger>
//             <TabsTrigger value="courses">Courses</TabsTrigger>
//             <TabsTrigger value="documents">Documents</TabsTrigger>
//             <TabsTrigger value="application">Application</TabsTrigger>
//             <TabsTrigger value="visa">Visa</TabsTrigger>
//           </TabsList>
          
//           <div className="flex-1 overflow-y-auto mt-4">
//             <TabsContent value="overview" className="space-y-6">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Basic Information</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Phone:</span>
//                       <span className="font-medium">{localStudent.phone}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Counselor:</span>
//                       <div className="flex items-center space-x-2">
//                         {isEditingCounselor ? (
//                           <Select value={localStudent.counselor || ''} onValueChange={updateCounselor}>
//                             <SelectTrigger className="w-40">
//                               <SelectValue placeholder="Select counselor" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="John Smith">John Smith</SelectItem>
//                               <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
//                               <SelectItem value="Michael Brown">Michael Brown</SelectItem>
//                               <SelectItem value="Emily Davis">Emily Davis</SelectItem>
//                               <SelectItem value="David Wilson">David Wilson</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         ) : (
//                           <>
//                             <span className="font-medium">{localStudent.counselor || 'Not assigned'}</span>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => setIsEditingCounselor(true)}
//                               className="h-6 w-6 p-0"
//                             >
//                               <Edit className="h-3 w-3" />
//                             </Button>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Target Country:</span>
//                       <span className="font-medium">{localStudent.country}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Application Path:</span>
//                       <Badge className={localStudent.applicationPath === 'SI' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
//                         {localStudent.applicationPath}
//                       </Badge>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Current Stage:</span>
//                       <Badge>{localStudent.currentStage}</Badge>
//                     </div>
//                   </CardContent>
//                 </Card>
                
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Progress Overview</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div>
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="text-sm text-gray-600">Overall Progress</span>
//                         <span className="text-sm font-medium text-gray-900">{Math.round(getProgressPercentage())}%</span>
//                       </div>
//                       <Progress value={getProgressPercentage()} className="h-2" />
//                     </div>
                    
//                     <div className="space-y-2">
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-gray-600">Documents</span>
//                         {Object.values(localStudent.documents || {}).every(Boolean) ? (
//                           <Check className="h-5 w-5 text-green-600" />
//                         ) : (
//                           <Clock className="h-5 w-5 text-orange-600" />
//                         )}
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-gray-600">Application</span>
//                         {localStudent.currentStage === 'application' || localStudent.currentStage === 'visa' || localStudent.currentStage === 'departed' ? (
//                           <Check className="h-5 w-5 text-green-600" />
//                         ) : (
//                           <Clock className="h-5 w-5 text-gray-300" />
//                         )}
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-gray-600">Visa</span>
//                         {localStudent.currentStage === 'visa' || localStudent.currentStage === 'departed' ? (
//                           <Check className="h-5 w-5 text-green-600" />
//                         ) : (
//                           <Clock className="h-5 w-5 text-gray-300" />
//                         )}
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </TabsContent>
            
//             <TabsContent value="courses" className="space-y-4">
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Universities & Courses</h3>
//                 <p className="text-gray-600 mb-4">{localStudent.courses?.length || 0} course{(localStudent.courses?.length || 0) !== 1 ? 's' : ''} selected for this student</p>
//               </div>
              
//               <div className="space-y-4">
//                 {localStudent.courses?.map((course, index) => (
//                   <Card key={course.id}>
//                     <CardContent className="p-6">
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.universityName}</h4>
//                           <p className="text-gray-700 mb-2">{course.courseName}</p>
//                           <div className="flex items-center space-x-4 text-sm text-gray-600">
//                             <span>
//                               <Calendar className="inline w-4 h-4 mr-1" />
//                               {course.intakeMonth}
//                             </span>
//                             {course.courseLink && (
//                               <a 
//                                 href={course.courseLink} 
//                                 target="_blank" 
//                                 rel="noopener noreferrer"
//                                 className="text-primary hover:text-primary/80"
//                               >
//                                 <ExternalLink className="inline w-4 h-4 mr-1" />
//                                 Course Link
//                               </a>
//                             )}
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <Badge className="bg-blue-100 text-blue-800">Priority {index + 1}</Badge>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )) || <p className="text-gray-500 text-center py-8">No courses selected</p>}
//               </div>
//             </TabsContent>
            
//             <TabsContent value="documents" className="space-y-4">
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Checklist</h3>
//                 <p className="text-gray-600">Track the status of required documents for application</p>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {[
//                   { key: 'passport', label: 'Passport', icon: '🛂' },
//                   { key: 'marksheets', label: 'Marksheets', icon: '📄' },
//                   { key: 'englishProficiency', label: 'IELTS/TOEFL', icon: '🗣️' },
//                   { key: 'sop', label: 'SOP', icon: '✍️' },
//                   { key: 'lors', label: 'LORs', icon: '✉️' },
//                   { key: 'resume', label: 'Resume', icon: '👔' },
//                 ].map((doc) => (
//                   <Card key={doc.key}>
//                     <CardContent className="p-4">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center">
//                           <span className="text-lg mr-3">{doc.icon}</span>
//                           <span className="font-medium text-gray-900">{doc.label}</span>
//                         </div>
//                         <Switch
//                           checked={localStudent.documents?.[doc.key as keyof typeof localStudent.documents] || false}
//                           onCheckedChange={(checked) => updateDocumentStatus(doc.key as keyof typeof localStudent.documents, checked)}
//                           disabled={isUpdatingStudent}
//                         />
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </TabsContent>
            
//             <TabsContent value="application" className="space-y-6">
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Progress</h3>
//                 <p className="text-gray-600">Track the application process and offer status</p>
//               </div>
              
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Application Path</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <RadioGroup 
//                     value={localStudent.applicationProgress?.path || 'direct'} 
//                     onValueChange={(value) => updateApplicationProgress('path', value)}
//                     className="flex space-x-4"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="direct" id="direct" />
//                       <Label htmlFor="direct">Direct</Label>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="indirect" id="indirect" />
//                       <Label htmlFor="indirect">Indirect</Label>
//                     </div>
//                   </RadioGroup>
//                 </CardContent>
//               </Card>
              
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Offer Type</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <RadioGroup 
//                     value={localStudent.applicationProgress?.offerType || ''} 
//                     onValueChange={(value) => updateApplicationProgress('offerType', value)}
//                     className="flex space-x-4"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="conditional" id="conditional" />
//                       <Label htmlFor="conditional">Conditional</Label>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="unconditional" id="unconditional" />
//                       <Label htmlFor="unconditional">Unconditional</Label>
//                     </div>
//                   </RadioGroup>
                  
//                   {localStudent.applicationProgress?.offerType === 'conditional' && (
//                     <div className="space-y-4 pt-4">
//                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                         <span className="text-gray-700">Loan process started</span>
//                         <Switch
//                           checked={localStudent.applicationProgress?.loanProcessStarted || false}
//                           onCheckedChange={(checked) => updateApplicationProgress('loanProcessStarted', checked)}
//                           disabled={isUpdatingStudent}
//                         />
//                       </div>
                      
//                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                         <span className="text-gray-700">Additional documents requested</span>
//                         <Switch
//                           checked={localStudent.applicationProgress?.additionalDocsRequested || false}
//                           onCheckedChange={(checked) => updateApplicationProgress('additionalDocsRequested', checked)}
//                           disabled={isUpdatingStudent}
//                         />
//                       </div>
//                     </div>
//                   )}
                  
//                   {localStudent.applicationProgress?.offerType === 'unconditional' && (
//                     <div className="space-y-4 pt-4">
//                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                         <span className="text-gray-700">Fee payment completed</span>
//                         <Switch
//                           checked={localStudent.applicationProgress?.feePaymentCompleted || false}
//                           onCheckedChange={(checked) => updateApplicationProgress('feePaymentCompleted', checked)}
//                           disabled={isUpdatingStudent}
//                         />
//                       </div>
                      
//                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                         <span className="text-gray-700">LOA/CAS received</span>
//                         <Switch
//                           checked={localStudent.applicationProgress?.loaCasReceived || false}
//                           onCheckedChange={(checked) => updateApplicationProgress('loaCasReceived', checked)}
//                           disabled={isUpdatingStudent}
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>
            
//             <TabsContent value="visa" className="space-y-6">
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Visa Processing</h3>
//                 <p className="text-gray-600">Track the visa application workflow and status</p>
//               </div>
              
//               <div className="space-y-4">
//                 {[
//                   { key: 'counsellingStarted', label: 'Visa counselling started', icon: '🎓' },
//                   { key: 'documentsReceived', label: 'Visa documents received', icon: '📋' },
//                   { key: 'applicationFiled', label: 'Visa application filed', icon: '📤' },
//                   { key: 'interviewScheduled', label: 'Visa interview scheduled', icon: '📅' },
//                   { key: 'departureTracking', label: 'Student departure tracking started', icon: '✈️' },
//                 ].map((item) => (
//                   <Card key={item.key}>
//                     <CardContent className="p-4">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center">
//                           <span className="text-lg mr-3">{item.icon}</span>
//                           <span className="font-medium text-gray-900">{item.label}</span>
//                         </div>
//                         <Switch
//                           checked={localStudent.visaProgress?.[item.key as keyof typeof localStudent.visaProgress] || false}
//                           onCheckedChange={(checked) => updateVisaProgress(item.key, checked)}
//                           disabled={isUpdatingStudent}
//                         />
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
                
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Visa Decision</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <RadioGroup 
//                       value={localStudent.visaProgress?.decision || 'pending'} 
//                       onValueChange={(value) => updateVisaProgress('decision', value)}
//                       className="flex space-x-4"
//                     >
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="approved" id="approved" />
//                         <Label htmlFor="approved">Approved</Label>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="rejected" id="rejected" />
//                         <Label htmlFor="rejected">Rejected</Label>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="pending" id="pending" />
//                         <Label htmlFor="pending">Pending</Label>
//                       </div>
//                     </RadioGroup>
//                   </CardContent>
//                 </Card>
//               </div>
//             </TabsContent>
//           </div>
//         </Tabs>
//       </DialogContent>
//     </Dialog>
//   );
// }
