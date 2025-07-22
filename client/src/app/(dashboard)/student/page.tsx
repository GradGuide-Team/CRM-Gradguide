
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
// client\src\app\(dashboard)\student\page.tsx
"use client";
import { Button } from '@/components/ui/button';
import axiosInstance from '@/services/axiosInstance';
import endpoints from '@/services/endpoints';
import { StudentDetail } from '@/types/student';
import { withAuth } from '@/wrapper/authWrapper'
import { BookOpen, Calendar, CreditCard, ExternalLink, FileText, Globe, Loader2, Mail, Phone, StickyNote, User, MessageSquare, ArrowDownCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { OverviewNotesDialog } from './components/OverviewNotesDialog';
import { UniversityNotesDialog } from './components/UniversityNotesDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const student = () => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('id')
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<StudentDetail | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUniversityNotesOpen, setIsUniversityNotesOpen] = useState(false);
  const [isOverviewNotesOpen, setIsOverviewNotesOpen] = useState(false);
  const [selectedUniversityIndex, setSelectedUniversityIndex] = useState(0);


  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!studentId) {
          setError("No student ID provided in the URL.");
          setLoading(false);
          return;
        }
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`${endpoints.getStudentById}/${studentId}`)
        if (response.status === 200) {
          const rawData = response.data;

          const processedStudent: StudentDetail = {
            ...rawData,
            dob: rawData.dob ? new Date(rawData.dob) : null,
          };
          setStudent(processedStudent);
          setEditedStudent(processedStudent);
        } else {
          throw new Error(`Failed to fetch student: Status ${response.status}`);
        }
      } catch (err: any) {
        console.error("Error in fetching student data:", err);
        const errorMessage = err.response?.data?.detail || err.message || "Failed to load student details.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedStudent(student); // Reset to original data
  };

  const handleSave = async () => {
    if (!editedStudent || !studentId) return;

    setIsSaving(true);
    try {
      const updateData = {
        full_name: editedStudent.full_name,
        email_address: editedStudent.email_address,
        phone_number: editedStudent.phone_number,
        target_country: editedStudent.target_country,
        degree_type: editedStudent.degree_type,
        dob: editedStudent.dob ? editedStudent.dob.toISOString() : null,
        // assigned_counselor_id: editedStudent.assigned_counselor_id,
        application_path: editedStudent.application_path,
        visa_documents: editedStudent.visa_documents,
        university_choices: editedStudent.university_choices,
        documents: editedStudent.documents
      };

      const response = await axiosInstance.patch(`${endpoints.updateStudent}/${studentId}`, updateData);

      if (response.status === 200) {
        const updatedRawData = response.data;
        const updatedProcessedStudent: StudentDetail = {
          ...updatedRawData,
          dob: updatedRawData.dob ? new Date(updatedRawData.dob) : null,
        };
        setStudent(updatedProcessedStudent);
        setIsEditing(false);
        console.log('Student updated successfully');
      } else {
        throw new Error(`Failed to update student: Status ${response.status}`);
      }
    } catch (err: any) {
      console.error("Error updating student:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to update student.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof StudentDetail, value: any) => {
    if (!editedStudent) return;

    setEditedStudent(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleDocumentChange = (docType: string, value: boolean) => {
    if (!editedStudent) return;

    setEditedStudent(prev => ({
      ...prev!,
      documents: {
        ...prev!.documents,
        [docType]: value
      }
    }));
  };

  const handleVisaDocumentChange = (field: string, value: any) => {
    if (!editedStudent) return;

    setEditedStudent(prev => ({
      ...prev!,
      visa_documents: {
        ...prev!.visa_documents,
        [field]: value
      }
    }));
  };
  const handleApplicationStatusUpdate = async (universityIndex: number, newStatus: string) => {
    if (!studentId) return;

    try {
      await axiosInstance.put(`${endpoints.updateApplicationStatus}/${studentId}/application-status`, {
        university_choice_index: universityIndex,
        new_status: newStatus
      });

      // Refetch student data to get updated logs
      const response = await axiosInstance.get(`${endpoints.getStudentById}/${studentId}`);
      const rawData = response.data;
      const processedStudent: StudentDetail = {
        ...rawData,
        dob: rawData.dob ? new Date(rawData.dob) : null,
      };
      setStudent(processedStudent);
      setEditedStudent(processedStudent);
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };
  const handleUniversityChoiceChange = (index: number, field: string, value: any) => {
    if (!editedStudent) return;

    const updatedChoices = [...editedStudent.university_choices];
    updatedChoices[index] = {
      ...updatedChoices[index],
      [field]: value
    };

    setEditedStudent(prev => ({
      ...prev!,
      university_choices: updatedChoices
    }));
  };

  const currentStudent = isEditing ? editedStudent : student;

  if (loading) {
    return (
      <div className='bg-white min-h-screen w-full flex items-center justify-center'>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-700">Loading student details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white min-h-screen w-full p-4 text-red-600'>
        <h1 className='text-2xl font-bold mb-4'>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!currentStudent) {
    return (
      <div className='bg-white min-h-screen w-full p-4 text-gray-700'>
        <h1 className='text-2xl font-bold mb-4'>Student Not Found</h1>
        <p>No details available for this student ID.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses & Applications' },
    { id: 'documents', label: 'Documents' },
    { id: 'visa', label: 'Visa' },
    { id: 'logs', label: 'Application Logs' },
    { id: 'notes', label: 'Notes' }
  ];
  const renderApplicationLogs = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Application Status Logs</h3>
        <p className="text-gray-600">Track all application status changes</p>
      </div>

      <div className="space-y-4">
        {currentStudent.status_logs?.map((log, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {log.previous_status ? `${log.previous_status} → ${log.new_status}` : `Initial status: ${log.new_status}`}
                </p>
                <p className="text-sm text-gray-600">
                  University: {currentStudent.university_choices[log.university_choice_index]?.university_name}
                </p>
                <p className="text-sm text-gray-600">
                  Changed by: {log.changed_by?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Overview Notes</h3>
        <p className="text-gray-600">Manual and automatic notes</p>
      </div>

      <div className="space-y-4">
        {currentStudent.overview_notes?.map((note, index) => (
          <div key={index} className={`rounded-lg p-4 ${note.type === 'automatic' ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${note.type === 'automatic' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {note.type}
                  </span>
                </div>
                <h4 className="font-medium">{note.title}</h4>
                <p className="text-gray-600 mt-1">{note.content}</p>
                <p className="text-sm text-gray-500 mt-2">By: {note.created_by?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="mr-2 h-5 w-5" />
            Basic Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Email:</span>
              {isEditing ? (
                <input
                  type="email"
                  value={editedStudent?.email_address || ''}
                  onChange={(e) => handleInputChange('email_address', e.target.value)}
                  className="ml-2 px-2 py-1 border rounded text-gray-900 flex-1"
                />
              ) : (
                <span className="ml-2 text-gray-900">{currentStudent.email_address}</span>
              )}
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Phone:</span>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedStudent?.phone_number || ''}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="ml-2 px-2 py-1 border rounded text-gray-900 flex-1"
                />
              ) : (
                <span className="ml-2 text-gray-900">{currentStudent.phone_number}</span>
              )}
            </div>
            <div className="flex items-center">
              <Globe className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Target Country:</span>
              {isEditing ? (
                // <input
                //   type="text"
                //   value={editedStudent?.target_country || ''}
                //   onChange={(e) => handleInputChange('target_country', e.target.value)}
                //   className="ml-2 px-2 py-1 border rounded text-gray-900 flex-1"
                // />
                <select
                  id="target_country"
                  value={editedStudent?.target_country || ''}
                  onChange={(e) => handleInputChange('target_country', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white`}

                >
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Germany">Germany</option>
                  <option value="Ireland">Ireland</option>
                </select>
              ) : (
                <span className="ml-2 text-gray-900">{currentStudent.target_country}</span>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-gray-600">Application Path:</span>
              {isEditing ? (
                <select
                  value={editedStudent?.application_path || 'Direct'}
                  onChange={(e) => handleInputChange('application_path', e.target.value)}
                  className="ml-2 px-2 py-1 border rounded text-gray-900"
                >
                  <option value="Direct">Direct</option>
                  <option value="SI">SI</option>
                  <option value="Eduwise">Eduwise</option>
                </select>
              ) : (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${currentStudent.application_path === "Direct"
                  ? "bg-blue-100 text-blue-800"
                  : currentStudent.application_path === "SI"
                    ? "bg-green-100 text-green-800"
                    : "bg-purple-100 text-purple-800"
                  }`}>
                  {currentStudent.application_path}
                </span>
              )}
            </div>

            <div className="flex items-center">
              <span className="text-gray-600">Date Of Birth:</span>
              {isEditing ? (
                <input
                  type="date" // This is the calendar input
                  value={editedStudent?.dob ? editedStudent.dob.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const dateString = e.target.value;
                    handleInputChange('dob', dateString ? new Date(dateString) : null);
                  }}
                  className="ml-2 px-2 py-1 border rounded text-gray-900"
                />
              ) : (
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium">
                  {currentStudent.dob ? currentStudent.dob.toLocaleDateString() : 'N/A'} {/* Format Date for display or show N/A */}
                </span>
              )}
            </div>

            <div className="flex items-center">
              <span className="text-gray-600">Degree Type</span>
              {isEditing ? (
                <select
                  value={editedStudent?.degree_type || 'Undergraduation'}
                  onChange={(e) => handleInputChange('degree_type', e.target.value)}
                  className="ml-2 px-2 py-1 border rounded text-gray-900"
                >
                  <option value="Undergraduation">Undergraduation</option>
                  <option value="Masters">Masters</option>
                  <option value="PHD">PHD</option>
                </select>
              ) : (
                <span className="ml-2 px-2 py-1 rounded-full text-sm font-normal ">
                  {currentStudent.degree_type || 'N/A'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Assigned Counselor</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 text-gray-900">{currentStudent.assigned_counselor?.name || ""}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 text-gray-900">{currentStudent.assigned_counselor.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Role:</span>
              <span className="ml-2 text-gray-900 capitalize">{currentStudent.assigned_counselor.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Timeline
        </h3>
        <div className="space-y-2">
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 text-gray-900">
              {new Date(currentStudent.created_at).toLocaleDateString()} at {new Date(currentStudent.created_at).toLocaleTimeString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 text-gray-900">
              {new Date(currentStudent.updated_at).toLocaleDateString()} at {new Date(currentStudent.updated_at).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCoursesAndApplications = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Courses & Application Tracking</h3>
        <p className="text-gray-600">{currentStudent.university_choices.length} course{currentStudent.university_choices.length !== 1 ? 's' : ''} with individual application tracking</p>
      </div>

      <div className="space-y-6">
        {currentStudent.university_choices.map((choice, index) => {
          const completedSteps = [
            choice.application_submitted,
            choice.additional_docs_requested,
            choice.loa_cas_received,
            choice.loan_process_started,
            choice.fee_payment_completed
          ].filter(Boolean).length;
          const totalSteps = 5;
          const progressPercentage = (completedSteps / totalSteps) * 100;

          return (
            <div key={index} className="border-l-4 border-blue-400 bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      Priority {index + 1}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUniversityIndex(index);
                        setIsUniversityNotesOpen(true);
                      }}
                      className="ml-auto"
                    >
                      <StickyNote className="h-4 w-4 mr-1" />
                      Notes ({choice.notes?.length || 0})
                    </Button>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${choice.application_status === "unconditional offer received" || choice.application_status === "conditional offer received"
                      ? "bg-green-100 text-green-800"
                      : choice.application_status === "documents pending" || choice.application_status === "application pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : choice.application_status === "Uni finalized"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                      {choice.application_status}
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={choice.university_name}
                        onChange={(e) => handleUniversityChoiceChange(index, 'university_name', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    ) : (
                      choice.university_name
                    )}
                  </h4>
                  <p className="text-gray-600">
                    {isEditing ? (
                      <input
                        type="text"
                        value={choice.course_name}
                        onChange={(e) => handleUniversityChoiceChange(index, 'course_name', e.target.value)}
                        className="w-full px-2 py-1 border rounded mt-1"
                      />
                    ) : (
                      choice.course_name
                    )}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={choice.intake_month}
                          onChange={(e) => handleUniversityChoiceChange(index, 'intake_month', e.target.value)}
                          className="px-2 py-1 border rounded"
                        />
                      ) : (
                        choice.intake_month
                      )}
                    </div>
                    {(choice.course_link || isEditing) && (
                      <div className="flex items-center">
                        {isEditing ? (
                          <input
                            type="url"
                            value={choice.course_link || ''}
                            onChange={(e) => handleUniversityChoiceChange(index, 'course_link', e.target.value)}
                            placeholder="Course link"
                            className="px-2 py-1 border rounded"
                          />
                        ) : (
                          <a
                            href={choice.course_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Course Link
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Application Progress</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm font-medium mt-1">{Math.round(progressPercentage)}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Application Status</h5>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" disabled={!isEditing}>
                        {choice.application_status ? (
                          <span className="capitalize flex  items-center justify-between cursor-pointer">{choice.application_status} <ArrowDownCircle className='ml-2'/> </span>
                        ) : (
                          "Select Status"
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["documents pending", "documents received", "application pending", "application filed", "conditional offer received", "unconditional offer received", "Uni finalized"].map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onSelect={() => isEditing && handleApplicationStatusUpdate(index, status)}
                          className="capitalize bg-white p-1 cursor-pointer hover:bg-slate-50 "
                        >
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Offer Type</h5>
                  <div className="flex gap-4">
                    {["Conditional", "Unconditional"].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name={`offer-${index}`}
                          value={type}
                          checked={choice.offer_type === type}
                          onChange={() => isEditing && handleUniversityChoiceChange(index, 'offer_type', type)}
                          disabled={!isEditing}
                          className="mr-2"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-sm">Application submitted</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${choice.application_submitted ? 'bg-blue-500' : 'bg-gray-300'
                      } ${isEditing ? 'cursor-pointer' : ''}`}
                      onClick={() => isEditing && handleUniversityChoiceChange(index, 'application_submitted', !choice.application_submitted)}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${choice.application_submitted ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-sm">Loan process started</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${choice.loan_process_started ? 'bg-blue-500' : 'bg-gray-300'
                      } ${isEditing ? 'cursor-pointer' : ''}`}
                      onClick={() => isEditing && handleUniversityChoiceChange(index, 'loan_process_started', !choice.loan_process_started)}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${choice.loan_process_started ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-sm">Additional documents requested</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${choice.additional_docs_requested ? 'bg-blue-500' : 'bg-gray-300'
                      } ${isEditing ? 'cursor-pointer' : ''}`}
                      onClick={() => isEditing && handleUniversityChoiceChange(index, 'additional_docs_requested', !choice.additional_docs_requested)}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${choice.additional_docs_requested ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-sm">Fee payment completed</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${choice.fee_payment_completed ? 'bg-blue-500' : 'bg-gray-300'
                      } ${isEditing ? 'cursor-pointer' : ''}`}
                      onClick={() => isEditing && handleUniversityChoiceChange(index, 'fee_payment_completed', !choice.fee_payment_completed)}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${choice.fee_payment_completed ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Documents Status</h3>
        <p className="text-gray-600">Track the submission status of required documents</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(currentStudent.documents).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${value ? 'bg-blue-500' : 'bg-gray-300'
                } ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && handleDocumentChange(key, !value)}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVisa = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Visa Documents</h3>
        <p className="text-gray-600">Track visa application progress and documentation</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-6">
          <h4 className="font-medium mb-2">Visa Decision</h4>
          <div className="flex gap-4">
            {["Pending", "Accepted", "Rejected"].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="radio"
                  name="visa-decision"
                  value={status}
                  checked={currentStudent.visa_documents.decision === status}
                  onChange={() => isEditing && handleVisaDocumentChange('decision', status)}
                  disabled={!isEditing}
                  className="mr-2"
                />
                <span className="text-sm">{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-sm">Counselling started</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${currentStudent.visa_documents.counselling_started ? 'bg-blue-500' : 'bg-gray-300'
              } ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={() => isEditing && handleVisaDocumentChange('counselling_started', !currentStudent.visa_documents.counselling_started)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentStudent.visa_documents.counselling_started ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-sm">Documents received</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${currentStudent.visa_documents.documents_received ? 'bg-blue-500' : 'bg-gray-300'
              } ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={() => isEditing && handleVisaDocumentChange('documents_received', !currentStudent.visa_documents.documents_received)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentStudent.visa_documents.documents_received ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-sm">Application filled</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${currentStudent.visa_documents.application_filled ? 'bg-blue-500' : 'bg-gray-300'
              } ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={() => isEditing && handleVisaDocumentChange('application_filled', !currentStudent.visa_documents.application_filled)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentStudent.visa_documents.application_filled ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-sm">Interview scheduled</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${currentStudent.visa_documents.interview_scheduled ? 'bg-blue-500' : 'bg-gray-300'
              } ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={() => isEditing && handleVisaDocumentChange('interview_scheduled', !currentStudent.visa_documents.interview_scheduled)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentStudent.visa_documents.interview_scheduled ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'courses':
        return renderCoursesAndApplications();
      case 'documents':
        return renderDocuments();
      case 'visa':
        return renderVisa();
      case 'logs':
        return renderApplicationLogs();
      case 'notes':
        return renderNotes();
      default:
        return renderOverview();
    }
  };

  return (
    <div className='bg-white min-h-screen w-full p-6'>
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedStudent?.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="px-2 py-1 border rounded"
                  />
                ) : (
                  currentStudent.full_name
                )}
              </h1>
              <p className="text-gray-600">{currentStudent.email_address}</p>
            </div>
          </div>
        </div>

        {/* Edit/Save/Cancel Buttons */}
        <div className="flex gap-3 mb-6">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Student
              </button>
              <button
                onClick={() => setIsOverviewNotesOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Overview Notes ({currentStudent.overview_notes?.length || 0})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {renderTabContent()}
        </div>
        <UniversityNotesDialog
          isOpen={isUniversityNotesOpen}
          onOpenChange={setIsUniversityNotesOpen}
          studentId={studentId!}
          universityIndex={selectedUniversityIndex}
          universityName={currentStudent.university_choices[selectedUniversityIndex]?.university_name || ''}
          existingNotes={currentStudent.university_choices[selectedUniversityIndex]?.notes || []}
          onNotesUpdated={() => {
            // Refetch student data
            const fetchStudent = async () => {
              const response = await axiosInstance.get(`${endpoints.getStudentById}/${studentId}`);
              const rawData = response.data;
              const processedStudent: StudentDetail = {
                ...rawData,
                dob: rawData.dob ? new Date(rawData.dob) : null,
              };
              setStudent(processedStudent);
              setEditedStudent(processedStudent);
            };
            fetchStudent();
          }}
        />

        <OverviewNotesDialog
          isOpen={isOverviewNotesOpen}
          onOpenChange={setIsOverviewNotesOpen}
          studentId={studentId!}
          studentName={currentStudent.full_name}
          existingNotes={currentStudent.overview_notes || []}
          onNotesUpdated={() => {
            // Refetch student data
            const fetchStudent = async () => {
              const response = await axiosInstance.get(`${endpoints.getStudentById}/${studentId}`);
              const rawData = response.data;
              const processedStudent: StudentDetail = {
                ...rawData,
                dob: rawData.dob ? new Date(rawData.dob) : null,
              };
              setStudent(processedStudent);
              setEditedStudent(processedStudent);
            };
            fetchStudent();
          }}
        />
      </div>

    </div>
  );
};

export default withAuth(student);