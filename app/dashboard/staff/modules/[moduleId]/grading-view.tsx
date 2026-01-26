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
import { Save } from 'lucide-react';

interface StudentGradingProps {
    students: any[];
    moduleId: string;
}

export default function StudentGradingClient({ students, moduleId }: StudentGradingProps) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [marksMap, setMarksMap] = useState<Record<string, string>>({});

    const handleMarkChange = (regId: string, val: string) => {
        setMarksMap(prev => ({ ...prev, [regId]: val }));
    };

    const handleSave = async (regId: string) => {
        const marksStr = marksMap[regId];
        if (!marksStr && marksStr !== '0') return; // Nothing to save

        const marks = parseFloat(marksStr);
        if (isNaN(marks) || marks < 0 || marks > 100) {
            toast.error("Invalid marks. Must be 0-100.");
            return;
        }

        setLoadingMap(prev => ({ ...prev, [regId]: true }));
        try {
            await updateStudentGrade(regId, marks);
            toast.success("Grade saved");
            // Clear input so it shows the persisted value (handled by re-render from server action revalidate? No, client state might need reset or just keep it)
            // Ideally we rely on revalidatePath refreshing the props.
        } catch (e) {
            toast.error("Failed to save grade");
        } finally {
            setLoadingMap(prev => ({ ...prev, [regId]: false }));
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Current Grade</TableHead>
                        <TableHead>Marks (0-100)</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student.registrationId}>
                            <TableCell className="font-medium">{student.studentNumber}</TableCell>
                            <TableCell>{student.studentName}</TableCell>
                            <TableCell>
                                {student.grade ? (
                                    <div className="flex flex-col">
                                        <span className="font-bold">{student.grade.grade}</span>
                                        <span className="text-xs text-muted-foreground">{student.grade.marks} marks</span>
                                    </div>
                                ) : (
                                    <Badge variant="secondary">Ungraded</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-24"
                                    placeholder={student.grade?.marks?.toString() || "-"}
                                    value={marksMap[student.registrationId] ?? (student.grade?.marks ?? "")}
                                    onChange={(e) => handleMarkChange(student.registrationId, e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSave(student.registrationId)}
                                    disabled={loadingMap[student.registrationId]}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {loadingMap[student.registrationId] ? "..." : "Save"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {students.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No students enrolled yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
