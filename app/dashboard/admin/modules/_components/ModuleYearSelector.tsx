'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ModuleYearSelector({ 
    academicYears, 
    currentYear,
    basePath = '/dashboard/admin/modules',
    allLabel = 'All Modules (Archive)'
}: { 
    academicYears: any[], 
    currentYear: string,
    basePath?: string,
    allLabel?: string
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleYearChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('year', value);
        router.push(`${basePath}?${params.toString()}`);
    };

    return (
        <Select value={currentYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Academic Year" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{allLabel}</SelectItem>
                <SelectItem value="active">Currently Active</SelectItem>
                {academicYears.map(y => (
                    <SelectItem key={y.academic_year_id} value={y.academic_year_id}>
                        {y.label} {y.active ? '(Active)' : ''}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
