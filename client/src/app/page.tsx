/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// client/src/app/dashboard/page.tsx
"use client";
import { withAuth } from '@/wrapper/authWrapper';
import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AddStudentDialog } from '@/components/AddStudentDialog';
import { useToast } from '@/hooks/use-toast';
import { StudentsTable } from '@/components/StudentsTable';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
export interface Student {
  id: string;
  userId: string;
  name: string;
  studentId: string;
  degreeType: 'masters' | 'bachelors' | 'phd';
  notes: string | null;
  birthdate: string;
  tempEmail: string;
  actualEmail: string;
  mailslurpInboxId: string;
  createdAt: string;
  studentType: 'SI' | 'Eduwise';
  unreadCount: number;
  lastEmailTime: string | null;
  emailStatus: 'none' | 'sent' | 'delivered' | 'failed';
}
// Only the changed parts of your Dashboard component

const Dashboard = () => {
  const { toast } = useToast();
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [students, setStudents] = useState<Student[]>([]); // CHANGED: Array instead of single student
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!token) {
        setError("Authentication token not found.");
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching from Node.js API...');
        const response = await fetch(`http://localhost:3001/api/students`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data: Student[] = await response.json(); // CHANGED: Expect array
        console.log('Node.js API response:', data);
        setStudents(data); // CHANGED: Set array
      } catch (e: any) {
        console.error("Failed to fetch student data:", e);
        setError(e.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [token, refetchTrigger]); // CHANGED: Added refetchTrigger

  if (loading) {
    return <div>Loading student data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleStudentAdded = () => {
    setRefetchTrigger(prev => prev + 1);
    toast({
      title: "Success!",
      description: "New student record created.",
      variant: "default",
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className='bg-white min-h-screen w-full p-4'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-black'>
            Dashboard ({students.length} students) {/* CHANGED: Show count */}
          </h1>

          <button
            onClick={() => setIsAddStudentDialogOpen(true)}
            className='flex items-center space-x-2 justify-center text-sm text-white bg-blue-500 px-4 h-10 rounded cursor-pointer hover:bg-blue-600 transition-colors duration-200 shadow-md'
          >
            <Plus size={20} />
            <p>Add Student</p>
          </button>
        </div>

        <StudentsTable refetchTrigger={refetchTrigger} />

        <AddStudentDialog
          isOpen={isAddStudentDialogOpen}
          onOpenChange={setIsAddStudentDialogOpen}
          onStudentAdded={handleStudentAdded}
        />

        {/* CHANGED: Moved inside main div and display all students */}
        {students.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Students from Node.js API</h2>
            {students.map((student) => (
              <div key={student.id} className="mb-4 p-4 border rounded bg-gray-50">
                <h3 className="font-bold">Student Profile: {student.name}</h3>
                <p>ID: {student.id}</p>
                <p>Student ID: {student.studentId}</p>
                <p>Email: {student.actualEmail}</p>
                <p>Degree: {student.degreeType}</p>
                <p>Account Created: {new Date(student.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
}

export default withAuth(Dashboard);