/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import endpoints from '@/services/endpoints';
import { Loader2, Plus, Minus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/services/axiosInstance';

// Interface for a single university choice as it will be SENT TO THE BACKEND
interface UniversityChoicePayload {
    university_name: string;
    course_name: string;
    course_link: string | null;
    intake_month: string;
    application_status: "documents pending" | "documents received" | "application pending" | "application filed" | "conditional offer received" | "unconditional offer received" | "Uni finalized";
}
interface SchoolMarksheet {
    x_year: string
    x_school_name: string
    x_cgpa: string
    xii_year: string
    xii_school_name: string
    xii_cgpa: string
    xii_english: string
    xii_maths?: string
    xii_stream: string
}

interface SemesterResult {
    semester: string;
    year: string;
    cgpa: string;
    grade: string;
    kt: string;
}

interface CollegeDetails {
    college_name: string;
    branch_name: string;
    stream: string;
    university_name: string;
    degree_earned: string;
    start_year: string;
    end_year: string;
    semesters: SemesterResult[];
    overall_cgpa: string;
    final_grade: string;
    total_kt: string;
}

// Interface for the entire student data payload sent to the backend
interface NewStudentData {
    full_name: string;
    email_address: string;
    phone_number: string;
    target_country: string;
    assigned_counselor_id: string;
    application_path: "Direct" | "Eduwise" | "SI";
    degree_type: "Undergraduation" | "Masters" | "PHD";
    dob: string;
    university_choices: UniversityChoicePayload[];
    school_marksheet: SchoolMarksheet;
    college_details?: CollegeDetails;
    parents_contact: string;
    parents_email: string;
    documents?: {
        passport: boolean;
        marksheets: boolean;
        english_exam: boolean;
        sop: boolean;
        lor: boolean;
        resume: boolean;
    };
}

// Interface for a single university choice as it's MANAGED IN THE FRONTEND STATE
interface UniversityChoiceState extends UniversityChoicePayload {
    priority: "Priority 1 Choice" | "Priority 2 Choice" | "Priority 3 Choice" | "Priority 4 Choice" | "Priority 5 Choice";
}

interface AddStudentDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onStudentAdded: () => void;
}

const DEFAULT_UNIVERSITY_CHOICE_STATE: Omit<UniversityChoiceState, 'priority'> = {
    university_name: '',
    course_name: '',
    course_link: '',
    intake_month: '',
    application_status: 'documents pending',
};
export function AddStudentDialog({ isOpen, onOpenChange, onStudentAdded }: AddStudentDialogProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [formData, setFormData] = useState<Omit<NewStudentData, 'university_choices'> & { university_choices: UniversityChoiceState[] }>({
        full_name: '',
        email_address: '',
        phone_number: '',
        target_country: '',
        assigned_counselor_id: user?._id || '',
        application_path: 'Direct',
        degree_type: 'Undergraduation',
        parents_contact: '',
        parents_email: '',
        dob: '',
        school_marksheet: {
            x_year: '',
            x_school_name: '',
            x_cgpa: '',
            xii_year: '',
            xii_school_name: '',
            xii_cgpa: '',
            xii_english: '',
            xii_maths: '',
            xii_stream: ''
        },
        college_details: {
            college_name: '',
            branch_name: '',
            stream: '',
            university_name: '',
            degree_earned: 'B.Tech',
            start_year: '',
            end_year: '',
            semesters: Array(8).fill(0).map((_, i) => ({
                semester: `SEM${i + 1}`,
                year: '',
                cgpa: '',
                grade: '',
                kt: '0'
            })),
            overall_cgpa: '',
            final_grade: '',
            total_kt: '0'
        },
        university_choices: [{ ...DEFAULT_UNIVERSITY_CHOICE_STATE, priority: 'Priority 1 Choice' }],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | undefined }>({});
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        setFieldErrors(prev => ({ ...prev, [id]: undefined }));
    };

    const handleUniChoiceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newUniChoices = [...prev.university_choices];
            newUniChoices[index] = {
                ...newUniChoices[index],
                [name]: value
            };
            return { ...prev, university_choices: newUniChoices };
        });
        setFieldErrors(prev => ({ ...prev, [`${name}-${index}`]: undefined }));
    };

    const handleAddUniversity = () => {
        if (formData.university_choices.length < 5) {
            const newPriority = `Priority ${formData.university_choices.length + 1} Choice` as UniversityChoiceState['priority'];
            setFormData(prev => ({
                ...prev,
                university_choices: [...prev.university_choices, { ...DEFAULT_UNIVERSITY_CHOICE_STATE, priority: newPriority }]
            }));
            setError(null);
        } else {
            toast({
                title: "Maximum Universities Reached",
                description: "You can add a maximum of 5 university choices.",
                variant: "default",
            });
        }
    };

    const handleRemoveUniversity = (index: number) => {
        if (formData.university_choices.length > 1) {
            setFormData(prev => {
                const newUniChoices = prev.university_choices.filter((_, i) => i !== index);
                return {
                    ...prev,
                    university_choices: newUniChoices.map((choice, i) => ({
                        ...choice,
                        priority: `Priority ${i + 1} Choice` as UniversityChoiceState['priority']
                    }))
                };
            });
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`university_name-${index}`];
                delete newErrors[`course_name-${index}`];
                delete newErrors[`intake_month-${index}`];
                return newErrors;
            });
        } else {
            toast({
                title: "Minimum University Choice",
                description: "You must have at least one university choice.",
                variant: "default",
            });
        }
    };

    const handleSchoolMarksheetChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            school_marksheet: {
                ...prev.school_marksheet,
                [name]: value
            }
        }))
        setFieldErrors(prev => ({ ...prev, [`school_marksheet_${name}`]: undefined }));
    }

    const handleParentsContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        setFieldErrors(prev => ({ ...prev, [id]: undefined }));
    };

    const handleCollegeDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            college_details: {
                ...prev.college_details!,
                [e.target.name]: e.target.value
            }
        }));
    };

    const handleSemesterChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedSemesters = [...prev.college_details!.semesters];
            updatedSemesters[index] = {
                ...updatedSemesters[index],
                [name]: value
            };
            
            // Calculate total KT and overall CGPA
            const totalKT = updatedSemesters.reduce((sum, sem) => sum + (parseInt(sem.kt) || 0), 0);
            const validSemesters = updatedSemesters.filter(sem => sem.cgpa && !isNaN(parseFloat(sem.cgpa)));
            const totalCGPA = validSemesters.reduce((sum, sem) => sum + parseFloat(sem.cgpa), 0);
            const avgCGPA = validSemesters.length > 0 ? (totalCGPA / validSemesters.length).toFixed(2) : '';

            return {
                ...prev,
                college_details: {
                    ...prev.college_details!,
                    semesters: updatedSemesters,
                    total_kt: totalKT.toString(),
                    overall_cgpa: avgCGPA
                }
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Counselor ID ", user?._id)

        setLoading(true);
        setError(null);
        const currentFieldErrors: { [key: string]: string } = {};

        if (!formData.school_marksheet.x_year) currentFieldErrors.school_marksheet_x_year = "Class 10 year is required.";
        if (!formData.school_marksheet.x_school_name) currentFieldErrors.school_marksheet_x_school_name = "Class 10 school name is required.";
        if (!formData.school_marksheet.x_cgpa) currentFieldErrors.school_marksheet_x_cgpa = "Class 10 CGPA is required.";
        if (!formData.school_marksheet.xii_year) currentFieldErrors.school_marksheet_xii_year = "Class 12 year is required.";
        if (!formData.school_marksheet.xii_school_name) currentFieldErrors.school_marksheet_xii_school_name = "Class 12 school name is required.";
        if (!formData.school_marksheet.xii_cgpa) currentFieldErrors.school_marksheet_xii_cgpa = "Class 12 CGPA is required.";
        if (!formData.school_marksheet.xii_english) currentFieldErrors.school_marksheet_xii_english = "Class 12 English marks are required.";
        if (!formData.school_marksheet?.xii_stream) currentFieldErrors.school_marksheet_xii_stream = "Class 12 stream is required.";

        setFieldErrors(currentFieldErrors);

        if (Object.keys(currentFieldErrors).length > 0) {
            setLoading(false);
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        // Check for counselor ID before proceeding
        if (!user?._id) {
            setLoading(false);
            setError("Assigned counselor ID is missing. Please log in again.");
            toast({
                title: "Authentication Error",
                description: "Assigned counselor ID is missing. Please log in again.",
                variant: "destructive",
            });
            return;
        }

        try {
            const studentData: any = {
                full_name: formData.full_name,
                email_address: formData.email_address,
                phone_number: formData.phone_number,
                target_country: formData.target_country,
                dob: formData.dob,
                university_choices: formData.university_choices.map(choice => ({
                    university_name: choice.university_name,
                    course_name: choice.course_name,
                    course_link: choice.course_link || null,
                    intake_month: choice.intake_month,
                    application_status: choice.application_status || 'documents pending',
                })),
                school_marksheet: {
                    ...formData.school_marksheet,
                    xii_maths: formData.school_marksheet.xii_maths || ''
                }
            };

            // Add college details if degree type is Masters
            if (formData.degree_type === 'Masters' && formData.college_details) {
                studentData.college_details = {
                    college_name: formData.college_details.college_name,
                    branch_name: formData.college_details.branch_name,
                    stream: formData.college_details.stream,
                    university_name: formData.college_details.university_name,
                    degree_earned: formData.college_details.degree_earned,
                    start_year: formData.college_details.start_year,
                    end_year: formData.college_details.end_year,
                    semesters: formData.college_details.semesters,
                    overall_cgpa: formData.college_details.overall_cgpa,
                    final_grade: formData.college_details.final_grade,
                    total_kt: formData.college_details.total_kt
                };
            }

            console.log("Final payload:", studentData); // Add this to debug

            const response = await axiosInstance.post(endpoints.student, studentData);

            if (response.status === 201 || response.status === 200) {
                toast({
                    title: "Student Added!",
                    description: `${formData.full_name} has been successfully added.`,
                    variant: "default",
                });

                setFormData({
                    full_name: '',
                    email_address: '',
                    phone_number: '',
                    target_country: '',
                    parents_contact: '',
                    parents_email: '',
                    assigned_counselor_id: user._id,
                    application_path: 'Direct',
                    degree_type: 'Undergraduation',
                    dob: '',
                    school_marksheet: {
                        x_year: '',
                        x_school_name: '',
                        x_cgpa: '',
                        xii_year: '',
                        xii_school_name: '',
                        xii_cgpa: '',
                        xii_english: '',
                        xii_maths: '',
                        xii_stream: ''
                    },
                    university_details: {
                        college_name: '',
                        branch_name: '',
                        fromYear: '',
                        toYear: ''
                    },
                    university_choices: [{ ...DEFAULT_UNIVERSITY_CHOICE_STATE, priority: 'Priority 1 Choice' }],
                });
                setFieldErrors({});
                setError(null);

                onStudentAdded?.();
                onOpenChange(false);
            } else {
                throw new Error(response.data?.detail || "Failed to add student with unexpected status.");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || "An unknown error occurred.";
            setError(errorMessage);
            toast({
                title: "Error adding student",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg md:min-w-xl lg:min-w-4xl w-full h-[90vh] transition-all duration-300 ease-in-out transform">
                <AlertDialogHeader className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Add New Student
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
                        Enter the basic information for the new student and their university choices (1-5).
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-300">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Student Basic Information Section */}
                    <div className="space-y-4 mx-2">
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-sm font-medium">Full Name *</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.full_name
                                        ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                />
                                {fieldErrors.full_name && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.full_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email_address" className="text-sm font-medium">Email Address *</Label>
                                <Input
                                    id="email_address"
                                    type="email"
                                    value={formData.email_address}
                                    onChange={handleInputChange}
                                    placeholder="john.doe@example.com"
                                    className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.email_address
                                        ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                />
                                {fieldErrors.email_address && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.email_address}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone_number" className="text-sm font-medium">Phone Number *</Label>
                                <Input
                                    id="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    placeholder="+1234567890"
                                    className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.phone_number
                                        ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                />
                                {fieldErrors.phone_number && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.phone_number}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="target_country" className="text-sm font-medium">Target Country *</Label>
                                {/* <Input
                                    id="target_country"
                                    value={formData.target_country}
                                    onChange={handleInputChange}
                                    placeholder="USA"
                                    className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.target_country
                                        ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                /> */}
                                <select
                                    id="target_country"
                                    value={formData.target_country}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.target_country
                                        ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}

                                >
                                    <option value="Australia">Australia</option>
                                    <option value="Canada">Canada</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="United States">United States</option>
                                    <option value="Germany">Germany</option>
                                    <option value="Ireland">Ireland</option>
                                </select>
                                {fieldErrors.target_country && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.target_country}
                                    </p>
                                )}
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor="application_path" className="text-sm font-medium">Application Path *</Label>
                                <select
                                    id="application_path"
                                    value={formData.application_path}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.application_path
                                        ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                >
                                    <option value="Direct">Direct</option>
                                    <option value="Eduwise">Eduwise</option>
                                    <option value="SI">SI</option>
                                </select>
                                {fieldErrors.application_path && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.application_path}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="degree_type" className="text-sm font-medium">Degree Type *</Label>
                                <select
                                    id="degree_type"
                                    value={formData.degree_type}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.degree_type
                                        ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                >
                                    <option value="Undergraduation">Undergraduation</option>
                                    <option value="Masters">Masters</option>
                                    <option value="PHD">PHD</option>
                                </select>
                                {fieldErrors.degree_type && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.degree_type}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dob" className="text-sm font-medium">Date of Birth *</Label>

                                <Input
                                    id="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.dob
                                        ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                />
                                {fieldErrors.dob && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.dob}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 mx-2">
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Parents Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parents_contact" className="text-sm font-medium">Parents Contact</Label>
                                <Input
                                    id="parents_contact"
                                    value={formData.parents_contact}
                                    onChange={handleParentsContactChange}
                                    placeholder="+1234567890"
                                    className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parents_email" className="text-sm font-medium">Parents Email</Label>
                                <Input
                                    id="parents_email"
                                    type="email"
                                    value={formData.parents_email}
                                    onChange={handleParentsContactChange}
                                    placeholder="parent@example.com"
                                    className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Education Details Section */}
                    <div className="space-y-4 mx-2">
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Education Details
                        </h3>

                        {/* Class 10 Details */}
                        <div className="border border-neutral-300 dark:border-neutral-700 p-4 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900">
                            <h4 className="text-md font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Class 10 Details *</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="x_year" className="text-sm font-medium">Year *</Label>
                                    <Input
                                        id="x_year"
                                        name="x_year"
                                        type="date"
                                        value={formData.school_marksheet.x_year}
                                        onChange={handleSchoolMarksheetChange}
                                        max={new Date().toISOString().split('T')[0]}

                                        className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.school_marksheet_x_marksheet ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {fieldErrors.school_marksheet_x_marksheet && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {fieldErrors.school_marksheet_x_marksheet}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="x_school_name" className="text-sm font-medium">School Name *</Label>
                                    <Input
                                        id="x_school_name"
                                        name="x_school_name"
                                        value={formData.school_marksheet.x_school_name}
                                        onChange={handleSchoolMarksheetChange}
                                        placeholder="ABC High School"
                                        className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.school_marksheet_x_school_name ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {fieldErrors.school_marksheet_x_school_name && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {fieldErrors.school_marksheet_x_school_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="x_cgpa" className="text-sm font-medium">CGPA *</Label>
                                    <Input
                                        id="x_cgpa"
                                        name="x_cgpa"
                                        value={formData.school_marksheet.x_cgpa}
                                        onChange={handleSchoolMarksheetChange}
                                        placeholder="9.2"
                                        className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.school_marksheet_x_cgpa ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {fieldErrors.school_marksheet_x_cgpa && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {fieldErrors.school_marksheet_x_cgpa}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Class 12 Details */}
                        <div className="border border-neutral-300 dark:border-neutral-700 p-4 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900">
                            <h4 className="text-md font-semibold text-neutral-800 dark:text-neutral-200 mb-3">Class 12 Details *</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="xii_year" className="text-sm font-medium"> Year *</Label>

                                    <Input
                                        id="xii_year"
                                        name="xii_year"
                                        type="date"
                                        value={formData.school_marksheet.xii_year}
                                        onChange={handleSchoolMarksheetChange}
                                        max={new Date().toISOString().split('T')[0]}

                                        className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.school_marksheet_x_marksheet ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {fieldErrors.school_marksheet_xii_marksheet && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {fieldErrors.school_marksheet_xii_marksheet}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="xii_school_name" className="text-sm font-medium">School Name *</Label>
                                    <Input
                                        id="xii_school_name"
                                        name="xii_school_name"
                                        value={formData.school_marksheet.xii_school_name}
                                        onChange={handleSchoolMarksheetChange}
                                        placeholder="XYZ Senior Secondary School"
                                        className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.school_marksheet_xii_school_name ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {fieldErrors.school_marksheet_xii_school_name && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {fieldErrors.school_marksheet_xii_school_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="xii_cgpa" className="text-sm font-medium">CGPA *</Label>
                                    <Input
                                        id="xii_cgpa"
                                        name="xii_cgpa"
                                        value={formData.school_marksheet.xii_cgpa}
                                        onChange={handleSchoolMarksheetChange}
                                        placeholder="9.5"
                                        className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.school_marksheet_xii_cgpa ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {fieldErrors.school_marksheet_xii_cgpa && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {fieldErrors.school_marksheet_xii_cgpa}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="xii_english" className="text-sm font-medium">English Marks *</Label>
                                    <Input
                                        id="xii_english"
                                        name="xii_english"
                                        value={formData.school_marksheet.xii_english}
                                        onChange={handleSchoolMarksheetChange}
                                        placeholder="85"
                                        className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.school_marksheet_xii_english ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {fieldErrors.school_marksheet_xii_english && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {fieldErrors.school_marksheet_xii_english}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="xii_maths" className="text-sm font-medium">Maths Marks</Label>
                                    <Input
                                        id="xii_maths"
                                        name="xii_maths"
                                        value={formData.school_marksheet.xii_maths || ''}
                                        onChange={handleSchoolMarksheetChange}
                                        placeholder="90 (optional)"
                                        className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="xii_stream" className="text-sm font-medium">Stream *</Label>
                                    <select
                                        id="xii_stream"
                                        name="xii_stream"
                                        value={formData.school_marksheet.xii_stream}
                                        onChange={handleSchoolMarksheetChange}
                                        className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors.school_marksheet_xii_stream ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    >
                                        <option value="">Select Stream</option>
                                        <option value="Science">Science</option>
                                        <option value="Commerce">Commerce</option>
                                        <option value="Arts">Arts</option>
                                    </select>
                                    {fieldErrors.school_marksheet_xii_stream && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {fieldErrors.school_marksheet_xii_stream}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* College Details - Only show for Masters */}
                        {formData.degree_type === 'Masters' && (
                            <div className="border border-neutral-300 dark:border-neutral-700 p-4 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900">
                                <h4 className="text-md font-semibold text-neutral-800 dark:text-neutral-200 mb-3">College Details *</h4>
                                
                                {/* College Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="college_name" className="text-sm font-medium">College Name *</Label>
                                        <Input
                                            id="college_name"
                                            name="college_name"
                                            value={formData.college_details?.college_name || ''}
                                            onChange={handleCollegeDetailsChange}
                                            placeholder="Enter college name"
                                            className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="university_name" className="text-sm font-medium">University Name *</Label>
                                        <Input
                                            id="university_name"
                                            name="university_name"
                                            value={formData.college_details?.university_name || ''}
                                            onChange={handleCollegeDetailsChange}
                                            placeholder="Enter university name"
                                            className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="branch_name" className="text-sm font-medium">Branch/Department *</Label>
                                        <Input
                                            id="branch_name"
                                            name="branch_name"
                                            value={formData.college_details?.branch_name || ''}
                                            onChange={handleCollegeDetailsChange}
                                            placeholder="e.g., Computer Science"
                                            className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="stream" className="text-sm font-medium">Stream *</Label>
                                        <Input
                                            id="stream"
                                            name="stream"
                                            value={formData.college_details?.stream || ''}
                                            onChange={handleCollegeDetailsChange}
                                            placeholder="e.g., Engineering, Commerce, Arts"
                                            className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="degree_earned" className="text-sm font-medium">Degree Earned *</Label>
                                        <select
                                            id="degree_earned"
                                            name="degree_earned"
                                            value={formData.college_details?.degree_earned || ''}
                                            onChange={handleCollegeDetailsChange}
                                            className="w-full px-3 py-2 border rounded-md transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="B.Tech">B.Tech</option>
                                            <option value="B.E.">B.E.</option>
                                            <option value="B.Sc.">B.Sc.</option>
                                            <option value="B.Com">B.Com</option>
                                            <option value="BA">BA</option>
                                            <option value="BBA">BBA</option>
                                            <option value="BCA">BCA</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="start_year" className="text-sm font-medium">Start Year *</Label>
                                        <Input
                                            type="number"
                                            id="start_year"
                                            name="start_year"
                                            value={formData.college_details?.start_year || ''}
                                            onChange={handleCollegeDetailsChange}
                                            placeholder="e.g., 2020"
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_year" className="text-sm font-medium">End Year *</Label>
                                        <Input
                                            type="number"
                                            id="end_year"
                                            name="end_year"
                                            value={formData.college_details?.end_year || ''}
                                            onChange={handleCollegeDetailsChange}
                                            placeholder="e.g., 2024"
                                            min="1900"
                                            max={new Date().getFullYear() + 5}
                                            className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="overall_cgpa" className="text-sm font-medium">Overall CGPA *</Label>
                                        <Input
                                            type="number"
                                            id="overall_cgpa"
                                            name="overall_cgpa"
                                            value={formData.college_details?.overall_cgpa || ''}
                                            onChange={handleCollegeDetailsChange}
                                            placeholder="e.g., 8.5"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="final_grade" className="text-sm font-medium">Final Grade</Label>
                                        <Input
                                            id="final_grade"
                                            name="final_grade"
                                            value={formData.college_details?.final_grade || ''}
                                            onChange={handleCollegeDetailsChange}
                                            placeholder="e.g., A, B+, etc."
                                            className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="total_kt" className="text-sm font-medium">Total KT (Backlogs)</Label>
                                        <Input
                                            type="number"
                                            id="total_kt"
                                            name="total_kt"
                                            value={formData.college_details?.total_kt || '0'}
                                            onChange={handleCollegeDetailsChange}
                                            min="0"
                                            className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Semester-wise Results */}
                                <div className="mt-6">
                                    <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Semester-wise Results</h5>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white dark:bg-neutral-800 rounded-lg overflow-hidden">
                                            <thead className="bg-gray-100 dark:bg-neutral-700">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Year</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">CGPA/%</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Grade</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">KT</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                                                {formData.college_details?.semesters?.map((semester, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {semester.semester}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                            <Input
                                                                type="text"
                                                                name="year"
                                                                value={semester.year || ''}
                                                                onChange={(e) => handleSemesterChange(index, e as any)}
                                                                placeholder="Year"
                                                                className="w-24 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:border-neutral-600"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                            <Input
                                                                type="text"
                                                                name="cgpa"
                                                                value={semester.cgpa || ''}
                                                                onChange={(e) => handleSemesterChange(index, e as any)}
                                                                placeholder="CGPA/%"
                                                                className="w-24 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:border-neutral-600"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                            <Input
                                                                type="text"
                                                                name="grade"
                                                                value={semester.grade || ''}
                                                                onChange={(e) => handleSemesterChange(index, e as any)}
                                                                placeholder="Grade"
                                                                className="w-16 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:border-neutral-600"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                            <Input
                                                                type="number"
                                                                name="kt"
                                                                value={semester.kt || '0'}
                                                                onChange={(e) => handleSemesterChange(index, e as any)}
                                                                min="0"
                                                                className="w-16 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:border-neutral-600"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                    {/* Dynamic University Choices Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            University Choices
                        </h3>

                        {formData.university_choices.map((uniChoice, index) => (
                            <div
                                key={index}
                                className="border border-neutral-300 dark:border-neutral-700 p-6 rounded-lg mt-4 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 relative shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01] animate-in fade-in-0 slide-in-from-bottom-3 duration-500"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        University Choice {index + 1}
                                    </h4>

                                    {formData.university_choices.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveUniversity(index)}
                                            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 hover:scale-110 transition-all duration-200"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className=" space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor={`priority-${index}`} className="text-sm font-medium">Priority</Label>
                                        <Input
                                            id={`priority-${index}`}
                                            value={uniChoice.priority}
                                            readOnly
                                            className="bg-neutral-200 dark:bg-neutral-700 dark:text-white cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`university_name-${index}`} className="text-sm font-medium">University Name *</Label>
                                        <Input
                                            id={`university_name-${index}`}
                                            name="university_name"
                                            value={uniChoice.university_name}
                                            onChange={(e) => handleUniChoiceChange(index, e)}
                                            placeholder="University of Toronto"
                                            className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors[`university_name-${index}`]
                                                ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                        />
                                        {fieldErrors[`university_name-${index}`] && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                                                <AlertCircle className="h-3 w-3" />
                                                {fieldErrors[`university_name-${index}`]}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`course_name-${index}`} className="text-sm font-medium">Course Name *</Label>
                                        <Input
                                            id={`course_name-${index}`}
                                            name="course_name"
                                            value={uniChoice.course_name}
                                            onChange={(e) => handleUniChoiceChange(index, e)}
                                            placeholder="Master of Computer Science"
                                            className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors[`course_name-${index}`]
                                                ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                        />
                                        {fieldErrors[`course_name-${index}`] && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                                                <AlertCircle className="h-3 w-3" />
                                                {fieldErrors[`course_name-${index}`]}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`course_link-${index}`} className="text-sm font-medium">Course Link (Optional)</Label>
                                        <Input
                                            id={`course_link-${index}`}
                                            name="course_link"
                                            type="url"
                                            value={uniChoice.course_link || ''}
                                            onChange={(e) => handleUniChoiceChange(index, e)}
                                            placeholder="https://www.example.com/course"
                                            className="transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor={`intake_month-${index}`} className="text-sm font-medium">Intake Month *</Label>
                                        <Input
                                            id={`intake_month-${index}`}
                                            name="intake_month"
                                            value={uniChoice.intake_month}
                                            onChange={(e) => handleUniChoiceChange(index, e)}
                                            placeholder="Fall 2025"
                                            className={`transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white ${fieldErrors[`intake_month-${index}`]
                                                ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800/50 shake-animation'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                        />
                                        {fieldErrors[`intake_month-${index}`] && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                                                <AlertCircle className="h-3 w-3" />
                                                {fieldErrors[`intake_month-${index}`]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`application_status-${index}`} className="text-sm font-medium">Application Status</Label>
                                        <select
                                            id={`application_status-${index}`}
                                            name="application_status"
                                            value={uniChoice.application_status}
                                            onChange={(e) => handleUniChoiceChange(index, e)}
                                            className="w-full px-3 py-2 border rounded-md transition-all duration-200 ease-in-out focus:scale-[1.01] bg-neutral-50 dark:bg-neutral-800 dark:text-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="documents pending">Documents Pending</option>
                                            <option value="documents received">Documents Received</option>
                                            <option value="application pending">Application Pending</option>
                                            <option value="application filed">Application Filed</option>
                                            <option value="conditional offer received">Conditional Offer Received</option>
                                            <option value="unconditional offer received">Unconditional Offer Received</option>
                                            <option value="Uni finalized">Uni Finalized</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.university_choices.length < 5 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddUniversity}
                                className="w-full mt-4 flex items-center justify-center space-x-2 border-dashed border-2 border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 transition-all duration-300 ease-in-out hover:scale-[1.02] group"
                            >
                                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                                <span>Add Another University ({formData.university_choices.length}/5)</span>
                            </Button>
                        )}
                    </div>
                </div>

                <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3  animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                    <AlertDialogCancel asChild>
                        <Button
                            variant="outline"
                            className="px-6 py-2 rounded-lg w-full sm:w-auto hover:scale-105 transition-all duration-200 ease-in-out"
                        >
                            Cancel
                        </Button>
                    </AlertDialogCancel>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center w-full sm:w-auto hover:scale-105 transition-all duration-200 ease-in-out disabled:scale-100 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Student
                            </>
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>

            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        .shake-animation {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
        </AlertDialog>
    );
}