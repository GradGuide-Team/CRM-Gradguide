// import { useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { useStudents } from "@/hooks/useStudents";
// import { Course, CourseApplicationProgress } from "@/types";
// import { Plus, X } from "lucide-react";

// interface AddStudentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
//   const { addStudent, isAddingStudent } = useStudents();
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     country: '',
//     counselor: '',
//     applicationPath: 'SI' as 'SI' | 'Eduwise',
//   });

//   const [courses, setCourses] = useState<Course[]>([
//     {
//       id: '1',
//       universityName: '',
//       courseName: '',
//       courseLink: '',
//       intakeMonth: '',
//       priority: 1,
//       applicationProgress: {
//         applicationSubmitted: false,
//         loanProcessStarted: false,
//         additionalDocsRequested: false,
//         feePaymentCompleted: false,
//         loaCasReceived: false,
//         applicationStatus: 'pending'
//       }
//     }
//   ]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (courses.length < 1) {
//       alert('Please add at least 1 course');
//       return;
//     }

//     // Validate that the first course is complete
//     const firstCourse = courses[0];
//     if (!firstCourse.universityName || !firstCourse.courseName || !firstCourse.intakeMonth) {
//       alert('Please complete all required fields for the first course');
//       return;
//     }

//     const studentData = {
//       ...formData,
//       courses,
//       currentStage: 'document',
//       documents: {
//         passport: false,
//         marksheets: false,
//         englishProficiency: false,
//         sop: false,
//         lors: false,
//         resume: false,
//       },
//       applicationProgress: {
//         path: formData.applicationPath,
//       },
//       visaProgress: {
//         counsellingStarted: false,
//         documentsReceived: false,
//         applicationFiled: false,
//         interviewScheduled: false,
//         decision: 'pending' as const,
//         departureTracking: false,
//       },
//     };

//     try {
//       addStudent();
//       onClose();
//       resetForm();
//     } catch (error) {
//       console.error('Error adding student:', error);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       email: '',
//       phone: '',
//       country: '',
//       counselor: '',
//       applicationPath: 'SI',
//     });
//     setCourses([
//       {
//         id: '1',
//         universityName: '',
//         courseName: '',
//         courseLink: '',
//         intakeMonth: '',
//         priority: 1,
//         applicationProgress: {
//           applicationSubmitted: false,
//           loanProcessStarted: false,
//           additionalDocsRequested: false,
//           feePaymentCompleted: false,
//           loaCasReceived: false,
//           applicationStatus: 'pending'
//         }
//       }
//     ]);
//   };

//   const addCourse = () => {
//     setCourses([...courses, {
//       id: Date.now().toString(),
//       universityName: '',
//       courseName: '',
//       courseLink: '',
//       intakeMonth: '',
//       priority: courses.length + 1,
//       applicationProgress: {
//         applicationSubmitted: false,
//         loanProcessStarted: false,
//         additionalDocsRequested: false,
//         feePaymentCompleted: false,
//         loaCasReceived: false,
//         applicationStatus: 'pending'
//       }
//     }]);
//   };

//   const removeCourse = (id: string) => {
//     if (courses.length > 1) {
//       setCourses(courses.filter(course => course.id !== id));
//     }
//   };

//   const updateCourse = (id: string, field: keyof Course, value: string) => {
//     setCourses(courses.map(course => 
//       course.id === id ? { ...course, [field]: value } : course
//     ));
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50 border-0 shadow-elegant">
//         <DialogHeader className="border-b border-gray-200 pb-4">
//           <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Add New Student</DialogTitle>
//           <p className="text-gray-600">Enter student information and add courses (minimum 1 required)</p>
//         </DialogHeader>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
//             <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
//               <CardTitle className="flex items-center">
//                 <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
//                   </svg>
//                 </div>
//                 Basic Information
//               </CardTitle>
//               <p className="text-gray-200 text-sm">Student personal and application details</p>
//             </CardHeader>
//             <CardContent className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">Full Name *</Label>
//                   <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) => setFormData({...formData, name: e.target.value})}
//                     placeholder="Enter student full name"
//                     required
//                     className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">Email Address *</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({...formData, email: e.target.value})}
//                     placeholder="student@email.com"
//                     required
//                     className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number *</Label>
//                   <Input
//                     id="phone"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                     placeholder="+91 98765 43210"
//                     required
//                     className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="country" className="text-sm font-semibold text-gray-700 mb-2 block">Target Country *</Label>
//                   <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
//                     <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200">
//                       <SelectValue placeholder="Select Country" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Canada">Canada</SelectItem>
//                       <SelectItem value="Australia">Australia</SelectItem>
//                       <SelectItem value="UK">United Kingdom</SelectItem>
//                       <SelectItem value="USA">United States</SelectItem>
//                       <SelectItem value="Germany">Germany</SelectItem>
//                       <SelectItem value="Ireland">Ireland</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label htmlFor="counselor" className="text-sm font-semibold text-gray-700 mb-2 block">Assigned Counselor</Label>
//                   <Select value={formData.counselor} onValueChange={(value) => setFormData({...formData, counselor: value})}>
//                     <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200">
//                       <SelectValue placeholder="Select counselor" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="John Smith">John Smith</SelectItem>
//                       <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
//                       <SelectItem value="Michael Brown">Michael Brown</SelectItem>
//                       <SelectItem value="Emily Davis">Emily Davis</SelectItem>
//                       <SelectItem value="David Wilson">David Wilson</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label htmlFor="path" className="text-sm font-semibold text-gray-700 mb-2 block">Application Path *</Label>
//                   <Select value={formData.applicationPath} onValueChange={(value: 'SI' | 'Eduwise') => setFormData({...formData, applicationPath: value})}>
//                     <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200">
//                       <SelectValue placeholder="Select application path" />
//                     </SelectTrigger>
//                     <SelectContent>
//                            <SelectItem value="Other">Direct</SelectItem>
//                       <SelectItem value="SI">SI</SelectItem>
//                       <SelectItem value="Eduwise">Eduwise</SelectItem>
                 
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
          
//           {/* Course Selection */}
//           <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
//             <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
//               <CardTitle className="flex items-center">
//                 <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
//                   <span className="text-lg font-bold">{courses.length}</span>
//                 </div>
//                 Course Selection ({courses.length} course{courses.length !== 1 ? 's' : ''} added)
//               </CardTitle>
//               <p className="text-blue-100 text-sm">Add universities and courses in order of preference (minimum 1 required)</p>
//             </CardHeader>
//             <CardContent className="space-y-6 p-6">
//               {courses.map((course, index) => (
//                 <div key={course.id} className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center">
//                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center mr-3 font-bold">
//                         {index + 1}
//                       </div>
//                       <div>
//                         <h4 className="font-bold text-gray-900">Priority {index + 1} Choice</h4>
//                         <p className="text-sm text-gray-600">University and course details</p>
//                       </div>
//                     </div>
//                     {courses.length > 1 && (
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => removeCourse(course.id)}
//                         className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                       >
//                         <X className="w-5 h-5" />
//                       </Button>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <Label className="text-sm font-semibold text-gray-700 mb-2 block">University Name *</Label>
//                       <Input
//                         value={course.universityName}
//                         onChange={(e) => updateCourse(course.id, 'universityName', e.target.value)}
//                         placeholder="e.g., University of Toronto"
//                         required
//                         className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200"
//                       />
//                     </div>
//                     <div>
//                       <Label className="text-sm font-semibold text-gray-700 mb-2 block">Course Name *</Label>
//                       <Input
//                         value={course.courseName}
//                         onChange={(e) => updateCourse(course.id, 'courseName', e.target.value)}
//                         placeholder="e.g., Master of Computer Science"
//                         required
//                         className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200"
//                       />
//                     </div>
//                     <div>
//                       <Label className="text-sm font-semibold text-gray-700 mb-2 block">Course Link</Label>
//                       <Input
//                         type="url"
//                         value={course.courseLink}
//                         onChange={(e) => updateCourse(course.id, 'courseLink', e.target.value)}
//                         placeholder="https://university.edu/course"
//                         className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200"
//                       />
//                     </div>
//                     <div>
//                       <Label className="text-sm font-semibold text-gray-700 mb-2 block">Intake Month *</Label>
//                       <Select value={course.intakeMonth} onValueChange={(value) => updateCourse(course.id, 'intakeMonth', value)}>
//                         <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 transition-all duration-200">
//                           <SelectValue placeholder="Select intake month" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="September 2024">September 2024</SelectItem>
//                           <SelectItem value="January 2025">January 2025</SelectItem>
//                           <SelectItem value="May 2025">May 2025</SelectItem>
//                           <SelectItem value="September 2025">September 2025</SelectItem>
//                           <SelectItem value="January 2026">January 2026</SelectItem>
//                           <SelectItem value="May 2026">May 2026</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>
//               ))}
              
//               <div className="text-center py-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={addCourse}
//                   className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-3"
//                 >
//                   <Plus className="w-5 h-5 mr-2" />
//                   Add Another Course
//                 </Button>
//                 <p className="text-sm text-gray-500 mt-2">
//                   {courses.length === 0 ? 'Add at least 1 course to continue' : 'Add more courses as needed'}
//                 </p>
//               </div>

//               {courses.length >= 1 && (
//                 <div className="text-center py-4">
//                   <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 font-medium">
//                     <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
//                     </svg>
//                     Minimum requirement met! You can add more courses if needed.
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
          
//           <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
//             <Button 
//               type="button" 
//               variant="outline" 
//               onClick={onClose}
//               className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-lg transition-all duration-200"
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={isAddingStudent || courses.length < 1}
//               className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isAddingStudent ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                   Adding Student...
//                 </div>
//               ) : (
//                 <div className="flex items-center">
//                   <Plus className="w-5 h-5 mr-2" />
//                   Add Student to System
//                 </div>
//               )}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
