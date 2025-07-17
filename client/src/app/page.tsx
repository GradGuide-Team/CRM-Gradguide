/* eslint-disable @typescript-eslint/no-unused-vars */
// client/src/app/dashboard/page.tsx
"use client";
import { withAuth } from '@/wrapper/authWrapper';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
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

const Dashboard = () => {
  const { toast } = useToast();
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

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
          <h1 className='text-2xl font-bold text-black'>Dashboard</h1>
          
          <button
            onClick={() => setIsAddStudentDialogOpen(true)}
            className='flex items-center space-x-2 justify-center text-sm text-white bg-blue-500 px-4 h-10 rounded cursor-pointer hover:bg-blue-600 transition-colors duration-200 shadow-md'
          >
            <Plus size={20}/>
            <p>Add Student</p>
          </button>
        </div>

        <StudentsTable refetchTrigger={refetchTrigger} />

        <AddStudentDialog
          isOpen={isAddStudentDialogOpen}
          onOpenChange={setIsAddStudentDialogOpen}
          onStudentAdded={handleStudentAdded}
        />
      </div>
    </QueryClientProvider>
  );
}

export default withAuth(Dashboard);