// import { useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { 
//   getStudents, 
//   getStudent, 
//   addStudent, 
//   updateStudent, 
//   deleteStudent,
// } from '@/lib/firebase';
// import { Student, DashboardStats } from '@/types';
// import { useToast } from '@/hooks/use-toast';

// export const useStudents = () => {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   const studentsQuery = useQuery({
//     queryKey: ['students'],
//     queryFn: getStudents,
//   });

//   const addStudentMutation = useMutation({
//     mutationFn: addStudent,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['students'] });
//       toast({
//         title: "Student added",
//         description: "Student has been successfully added to the system",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Failed to add student",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const updateStudentMutation = useMutation({
//     mutationFn: ({ id, updates }: { id: string; updates: any }) => 
//       updateStudent(id, updates),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['students'] });
//       toast({
//         title: "Student updated",
//         description: "Student information has been updated",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Failed to update student",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const deleteStudentMutation = useMutation({
//     mutationFn: deleteStudent,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['students'] });
//       toast({
//         title: "Student deleted",
//         description: "Student has been removed from the system",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Failed to delete student",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const getDashboardStats = (): DashboardStats => {
//     const students = studentsQuery.data || [];

//     return {
//       totalStudents: students.length,
//       documentStage: students.filter((s: Student) => s.currentStage === 'document').length,
//       applicationStage: students.filter((s: Student) => s.currentStage === 'application').length,
//       visaStage: students.filter((s: Student) => s.currentStage === 'visa').length,
//       departed: students.filter((s: Student) => s.currentStage === 'departed').length,
//       siApplications: students.filter((s: Student) => s.applicationPath === 'SI').length,
//       eduwiseApplications: students.filter((s: Student) => s.applicationPath === 'Eduwise').length,
//     };
//   };

//   return {
//     students: studentsQuery.data || [],
//     isLoading: studentsQuery.isLoading,
//     error: studentsQuery.error,
//     addStudent: addStudentMutation.mutate,
//     updateStudent: updateStudentMutation.mutate,
//     deleteStudent: deleteStudentMutation.mutate,
//     isAddingStudent: addStudentMutation.isPending,
//     isUpdatingStudent: updateStudentMutation.isPending,
//     isDeletingStudent: deleteStudentMutation.isPending,
//     dashboardStats: getDashboardStats(),
//   };
// };

// export const useStudent = (id: string) => {
//   return useQuery({
//     queryKey: ['students', id],
//     queryFn: () => getStudent(id),
//     enabled: !!id,
//   });
// };
