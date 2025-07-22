/* eslint-disable @typescript-eslint/no-explicit-any */
// client\src\app\(dashboard)\student\components\OverviewNotesDialog.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, FileText, Calendar, User, Bot } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import endpoints from '@/services/endpoints';
import { OverviewNote } from '@/types/student';

interface OverviewNotesDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    studentId: string;
    studentName: string;
    existingNotes: OverviewNote[];
    onNotesUpdated: () => void;
}

export function OverviewNotesDialog({
    isOpen,
    onOpenChange,
    studentId,
    studentName,
    existingNotes,
    onNotesUpdated
}: OverviewNotesDialogProps) {
    const { toast } = useToast();
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddNote = async () => {
        if (!newNote.title.trim() && !newNote.content.trim()) {
            toast({
                title: "Validation Error",
                description: "Please provide either a title or content for the note.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post(
                `${endpoints.addOverviewNote}/${studentId}/overview-notes`,
                {
                    title: newNote.title.trim() || null,
                    content: newNote.content.trim() || null,
                }
            );

            if (response.status === 200) {
                toast({
                    title: "Note Added!",
                    description: "Overview note has been successfully added.",
                    variant: "default",
                });

                setNewNote({ title: '', content: '' });
                onNotesUpdated();
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || "Failed to add note.";
            setError(errorMessage);
            toast({
                title: "Error adding note",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setNewNote({ title: '', content: '' });
        setError(null);
        onOpenChange(false);
    };

    // Separate manual and automatic notes
    const manualNotes = existingNotes.filter(note => note.type === 'manual');
    const automaticNotes = existingNotes.filter(note => note.type === 'automatic');

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg  w-full md:min-w-xl lg:min-w-4xl max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-blue-600">
                        Overview Notes - {studentName}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
                        View automatic logs and add manual notes for this student.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-6 py-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Automatic Notes (Logs) */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                                <Bot className="h-5 w-5 text-blue-500" />
                                Automatic Logs ({automaticNotes.length})
                            </h3>
                            
                            {automaticNotes.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500">
                                    <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                    <p>No automatic logs yet.</p>
                                    <p className="text-sm">Logs will appear when application status changes.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {automaticNotes.map((note, index) => (
                                        <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded text-xs font-medium">
                                                    automatic
                                                </span>
                                            </div>
                                            {note.title && (
                                                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                                                    {note.title}
                                                </h4>
                                            )}
                                            {note.content && (
                                                <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-3">
                                                    {note.content}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-neutral-500">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>{note.created_by?.name || 'System'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Manual Notes */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-500" />
                                Manual Notes ({manualNotes.length})
                            </h3>
                            
                            {manualNotes.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500">
                                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                    <p>No manual notes yet.</p>
                                    <p className="text-sm">Add your first note below!</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {manualNotes.map((note, index) => (
                                        <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-1 rounded text-xs font-medium">
                                                    manual
                                                </span>
                                            </div>
                                            {note.title && (
                                                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                                                    {note.title}
                                                </h4>
                                            )}
                                            {note.content && (
                                                <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-3">
                                                    {note.content}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-neutral-500">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>{note.created_by?.name || 'Unknown'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add New Manual Note Section */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                            Add New Manual Note
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="note-title" className="text-sm font-medium">
                                    Title (Optional)
                                </Label>
                                <Input
                                    id="note-title"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter note title..."
                                    className="bg-neutral-50 dark:bg-neutral-800 dark:text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note-content" className="text-sm font-medium">
                                    Content (Optional)
                                </Label>
                                <Textarea
                                    id="note-content"
                                    value={newNote.content}
                                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Enter note content..."
                                    rows={4}
                                    className="bg-neutral-50 dark:bg-neutral-800 dark:text-white resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleAddNote}
                                disabled={loading || (!newNote.title.trim() && !newNote.content.trim())}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding Note...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Manual Note
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="px-6 py-2"
                        >
                            Close
                        </Button>
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}