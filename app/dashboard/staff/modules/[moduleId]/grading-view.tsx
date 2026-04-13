'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateStudentGrade } from '@/lib/actions/staff-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, Download, Upload, CheckCircle, Clock, Send, FileSpreadsheet } from 'lucide-react';
import { bulkUploadStaffGrades, releaseModuleGrades } from '@/lib/actions/staff-actions';

interface StudentGradingProps {
    students: any[];
    moduleId: string;
}

export default function StudentGradingClient({ students, moduleId }: StudentGradingProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleMarkChange = (regId: string, val: string) => {
        setMarksMap(prev => ({ ...prev, [regId]: val }));
    };

    const handleSave = async (regId: string) => {
        const marksStr = marksMap[regId];
        if (!marksStr && marksStr !== '0') return; 

        const marks = parseFloat(marksStr);
        if (isNaN(marks) || marks < 0 || marks > 100) {
            toast.error("Invalid marks. Must be 0-100.");
            return;
        }

        setLoadingMap(prev => ({ ...prev, [regId]: true }));
        try {
            await updateStudentGrade(regId, marks);
            toast.success("Grade saved as Draft");
        } catch (e) {
            toast.error("Failed to save grade");
        } finally {
            setLoadingMap(prev => ({ ...prev, [regId]: false }));
        }
    };

    const handlePublishAll = async () => {
        setIsPublishing(true);
        try {
            await releaseModuleGrades(moduleId);
            toast.success("All grades published successfully");
        } catch (e) {
            toast.error("Failed to publish grades");
        } finally {
            setIsPublishing(false);
        }
    };

    const downloadTemplate = () => {
        const headers = "StudentNumber,Marks\n";
        const rows = students.map(s => `${s.studentNumber},`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `grading_template_${moduleId}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').slice(1); // Skip header
            const payload = lines
                .map(line => {
                    const [studentNumber, marks] = line.split(',');
                    return { studentNumber: studentNumber?.trim(), marks: parseFloat(marks?.trim()) };
                })
                .filter(item => item.studentNumber && !isNaN(item.marks));

            try {
                const res = await bulkUploadStaffGrades(moduleId, payload);
                toast.success(`Succesfully uploaded ${res.successCount} grades. ${res.failCount} errors.`);
            } catch (e) {
                toast.error("CSV Processing failed");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-muted/20 border border-muted-foreground/5 backdrop-blur-md shadow-inner">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase tracking-tighter text-[10px]" onClick={downloadTemplate}>
                        <Download className="mr-2 h-3.5 w-3.5" />
                        Template
                    </Button>
                    <div className="relative">
                        <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase tracking-tighter text-[10px]" disabled={isUploading}>
                            <Upload className="mr-2 h-3.5 w-3.5" />
                            {isUploading ? "Uploading..." : "Bulk CSV"}
                        </Button>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleCSVUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={isUploading}
                        />
                    </div>
                </div>

                <Button 
                    variant="default" 
                    size="sm" 
                    className="rounded-xl font-bold uppercase tracking-tighter text-[10px] bg-primary shadow-lg shadow-primary/20"
                    onClick={handlePublishAll}
                    disabled={isPublishing}
                >
                    <Send className="mr-2 h-3.5 w-3.5" />
                    {isPublishing ? "Publishing..." : "Release All Grades"}
                </Button>
            </div>

            <div className="rounded-3xl border border-muted-foreground/10 overflow-hidden bg-background/50 shadow-2xl shadow-muted/20">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="border-b border-muted-foreground/5">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Student Enrollment</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Mark Registry</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Lifecycle Status</TableHead>
                            <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Management</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.registrationId} className="border-b border-muted-foreground/5 hover:bg-muted/20 transition-colors group">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-black text-sm">{student.studentName}</span>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{student.studentNumber}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-16 h-8 rounded-lg bg-background/50 border-muted-foreground/10 text-xs font-bold focus:ring-primary/20"
                                            placeholder={student.grade?.marks?.toString() || "-"}
                                            value={marksMap[student.registrationId] ?? (student.grade?.marks ?? "")}
                                            onChange={(e) => handleMarkChange(student.registrationId, e.target.value)}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase">{student.grade?.grade || "F"}</span>
                                            <span className="text-[10px] text-muted-foreground">Preview Grade</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {student.grade ? (
                                        student.grade.isReleased ? (
                                            <Badge className="bg-green-500/10 text-green-600 border-none rounded-lg px-2 py-0.5 text-[10px] uppercase font-black tracking-widest inline-flex items-center gap-1.5">
                                                <CheckCircle className="h-3 w-3" />
                                                Published
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-amber-500/10 text-amber-600 border-none rounded-lg px-2 py-0.5 text-[10px] uppercase font-black tracking-widest inline-flex items-center gap-1.5 animate-pulse">
                                                <Clock className="h-3 w-3" />
                                                Review Draft
                                            </Badge>
                                        )
                                    ) : (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Not Registered</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-xl h-8 text-[10px] font-black uppercase tracking-tighter hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                                        onClick={() => handleSave(student.registrationId)}
                                        disabled={loadingMap[student.registrationId]}
                                    >
                                        <Save className="h-3.5 w-3.5 mr-1.5" />
                                        {loadingMap[student.registrationId] ? "..." : "Save Draft"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
