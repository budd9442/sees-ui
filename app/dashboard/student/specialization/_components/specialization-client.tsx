'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SPECIALIZATIONS = [
    { id: 'BSE', name: 'Business Systems Engineering', description: 'Design and manage complex business systems.' },
    { id: 'OSCM', name: 'Operations & Supply Chain', description: 'Optimize logistics and operations.' },
    { id: 'IS', name: 'Information Systems', description: 'Manage IT infrastructure and data.' }
];

export default function SpecializationClient() {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (id: string) => {
        setSelected(id);
        toast.success(`Selected ${id}`);
        // In real app, call server action here
    };

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Specialization Selection" description="Choose your major for the MIT program" />
            <div className="grid md:grid-cols-3 gap-6 mt-6">
                {SPECIALIZATIONS.map((spec) => (
                    <Card key={spec.id} className={selected === spec.id ? 'border-primary border-2' : ''}>
                        <CardHeader>
                            <CardTitle>{spec.name}</CardTitle>
                            <CardDescription>{spec.id}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-4">{spec.description}</p>
                            <Button
                                className="w-full"
                                variant={selected === spec.id ? 'default' : 'outline'}
                                onClick={() => handleSelect(spec.id)}
                            >
                                {selected === spec.id ? 'Selected' : 'Select'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
