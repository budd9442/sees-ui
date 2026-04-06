'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleStat {
    id: string;
    code: string;
    name: string;
    enrolled: number;
    capacity: number;
    percentage: number;
}

interface StaffEnrollmentClientProps {
    initialStats: ModuleStat[];
}

export function StaffEnrollmentClient({ initialStats }: StaffEnrollmentClientProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStats = initialStats.filter(s => 
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const oversubscribed = filteredStats.filter(s => s.percentage >= 100).length;
    const nearCapacity = filteredStats.filter(s => s.percentage >= 80 && s.percentage < 100).length;

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Total Modules
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initialStats.length}</div>
                    </CardContent>
                </Card>

                <Card className={nearCapacity > 0 ? 'border-orange-200 bg-orange-50/20' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-4 w-4" />
                            Near Capacity (80%+)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{nearCapacity}</div>
                    </CardContent>
                </Card>

                <Card className={oversubscribed > 0 ? 'border-red-200 bg-red-50/20' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            Oversubscribed (100%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{oversubscribed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* List & Filtering */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Enrollment Heatmap</CardTitle>
                            <CardDescription>Visualizing student intake across all active modules.</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by code or name..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {filteredStats.map((module) => (
                            <div key={module.id} className="p-4 border rounded-lg hover:shadow-sm transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1 min-w-[240px]">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm tracking-wide text-primary">{module.code}</span>
                                            {module.percentage >= 100 && (
                                                <Badge variant="destructive" className="text-[10px] h-4">FULL</Badge>
                                            )}
                                        </div>
                                        <p className="font-medium">{module.name}</p>
                                    </div>

                                    <div className="flex-1 max-w-md space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span>
                                                {module.percentage >= 100 ? (
                                                    <span className="text-red-600 font-bold flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" /> AT CAPACITY
                                                    </span>
                                                ) : module.percentage >= 80 ? (
                                                    <span className="text-orange-600 font-bold flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" /> LOW SEATS
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 font-bold flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" /> OPEN
                                                    </span>
                                                )}
                                            </span>
                                            <span className="font-mono">{module.enrolled} / {module.capacity} ({module.percentage}%)</span>
                                        </div>
                                        <Progress 
                                            value={module.percentage} 
                                            className={cn(
                                                "h-2",
                                                module.percentage >= 100 ? "[&>div]:bg-red-500" :
                                                module.percentage >= 80 ? "[&>div]:bg-orange-500" : ""
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 md:justify-end min-w-[100px]">
                                        <Badge variant="outline">{module.capacity} Limit</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredStats.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No modules found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
