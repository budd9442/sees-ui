'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { upsertProgramIntake } from '@/lib/actions/admin-programs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Props = {
    programId: string;
    intakes: any[]; // Using any to avoid complex type mapping, in production define proper type
    academicYears: any[];
};

export function ProgramIntakeConfig({ programId, intakes, academicYears }: Props) {
    const [selectedYear, setSelectedYear] = useState(academicYears[0]?.academic_year_id || '');
    const [min, setMin] = useState('0');
    const [max, setMax] = useState('100');
    const [status, setStatus] = useState<'OPEN' | 'CLOSED' | 'UPCOMING'>('OPEN');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!selectedYear) return toast.error("Select Academic Year");

        setLoading(true);
        try {
            await upsertProgramIntake({
                programId,
                academicYearId: selectedYear,
                minStudents: parseInt(min),
                maxStudents: parseInt(max),
                status
            });
            toast.success("Intake settings saved");
        } catch (error) {
            toast.error("Failed to save settings");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Configure New Intake</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2 space-y-2">
                            <Label>Academic Year</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map(y => (
                                        <SelectItem key={y.academic_year_id} value={y.academic_year_id}>
                                            {y.code} ({y.start_date ? new Date(y.start_date).getFullYear() : 'N/A'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Min Students</Label>
                            <Input type="number" value={min} onChange={e => setMin(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Students</Label>
                            <Input type="number" value={max} onChange={e => setMax(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OPEN">Open</SelectItem>
                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button className="mt-4 w-full md:w-auto" onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                {intakes.map(intake => (
                    <Card key={intake.intake_id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-medium">
                                    {intake.academic_year.code}
                                </CardTitle>
                                <Badge variant={intake.status === 'OPEN' ? 'default' : 'secondary'}>
                                    {intake.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {intake.min_students} - {intake.max_students}
                            </div>
                            <p className="text-xs text-muted-foreground">Target Enrollment Range</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
