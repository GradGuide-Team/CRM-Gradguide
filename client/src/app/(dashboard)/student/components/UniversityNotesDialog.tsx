/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// client\src\app\(dashboard)\student\components\UniversityNotesDialog.tsx
"use client"
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/services/axiosInstance';
import endpoints from '@/services/endpoints';
import { UniversityNote } from '@/types/student';
import react, { useState } from 'react';
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
import { Loader2, Plus, Edit3, Calendar, User } from 'lucide-react';
interface UniversityNotesDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    studentId: string;
    universityIndex: number;
    universityName: string;
    existingNotes: UniversityNote[];
    onNotesUpdated: () => void;
}

export function UniversityNotesDialog({
    isOpen,
    onOpenChange,
    studentId,
    universityIndex,
    universityName,
    existingNotes,
    onNotesUpdated
}: UniversityNotesDialogProps) {
    const { toast } = useToast();

    const [newNote, setNewNote] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddNote = async () => {
        if (!newNote.title.trim() && !newNote.description.trim()) {
            toast({
                title: "Validation Error",
                description: "Please provide either a title or description for the note.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post(
                `${endpoints.addUniversityNote}/${studentId}/university-notes/${universityIndex}`,
                {
                    title: newNote.title.trim() || null,
                    description: newNote.description.trim() || null,
                }
            );

            if (response.status === 200) {
                toast({
                    title: "Note Added!",
                    description: "University note has been successfully added.",
                    variant: "default",
                });

                setNewNote({ title: '', description: '' });
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
        setNewNote({ title: '', description: '' });
        setError(null);
        onOpenChange(false);
    };
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg w-full md:min-w-xl lg:min-w-4xl  max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-blue-600">
                        University Notes - {universityName}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
                        Add and view notes specific to this university choice.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-6 py-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Existing Notes Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                            Existing Notes ({existingNotes.length})
                        </h3>
                        
                        {existingNotes.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                                <Edit3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No notes yet for this university.</p>
                                <p className="text-sm">Add your first note below!</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {existingNotes.map((note, index) => (
                                    <div key={index} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                                        {note.title && (
                                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                                                {note.title}
                                            </h4>
                                        )}
                                        {note.description && (
                                            <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-3">
                                                {note.description}
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

                    {/* Add New Note Section */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                            Add New Note
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
                                <Label htmlFor="note-description" className="text-sm font-medium">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="note-description"
                                    value={newNote.description}
                                    onChange={(e) => setNewNote(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter note description..."
                                    rows={4}
                                    className="bg-neutral-50 dark:bg-neutral-800 dark:text-white resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleAddNote}
                                disabled={loading || (!newNote.title.trim() && !newNote.description.trim())}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding Note...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Note
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
