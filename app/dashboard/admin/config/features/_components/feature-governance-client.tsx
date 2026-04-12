'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    ShieldCheck,
    Settings2,
    Lock,
    Users,
    Clock,
    Plus,
    Search,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Calendar,
    Hourglass
} from 'lucide-react';
import { toggleFeatureFlag, deleteFeatureFlag } from '@/app/actions/feature-flags';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string | null;
    isEnabled: boolean;
    targetRoles: string[];
    startDate: string | Date | null;
    endDate: string | Date | null;
    updatedAt: string | Date;
}

interface FeatureGovernanceClientProps {
    initialFlags: FeatureFlag[];
}

export default function FeatureGovernanceClient({ initialFlags }: FeatureGovernanceClientProps) {
    const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const filteredFlags = flags.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.key.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggle = async (id: string, currentStatus: boolean) => {
        // Optimistic update - local prediction of the 2-week window
        const now = new Date();
        const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        
        setFlags(prev => prev.map(f => f.id === id ? { 
            ...f, 
            isEnabled: !currentStatus,
            startDate: !currentStatus ? now : f.startDate,
            endDate: !currentStatus ? twoWeeksLater : f.endDate
        } : f));

        try {
            const res = await toggleFeatureFlag(id);
            if (!res.success) throw new Error(res.error);
            // Refresh with actual server state
            setFlags(prev => prev.map(f => f.id === id ? (res.data as any) : f));
            toast.success(`Feature state and timeline synchronized`);
        } catch (error: any) {
            setFlags(prev => prev.map(f => f.id === id ? { ...f, isEnabled: currentStatus } : f));
            toast.error(error.message || "Failed to sync feature state");
        }
    };

    const getRemainingDays = (endDate: string | Date | null) => {
        if (!endDate) return null;
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Feature Governance"
                    description="Centralized control for system capabilities, visibility, and access rules."
                />
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Sync State
                    </Button>
                    <Button size="sm" className="shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4 mr-2" /> Define New Feature
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {/* Stats Summary */}
                <Card className="md:col-span-1 bg-zinc-950 text-white border-zinc-800 shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Governance Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">Active Features</span>
                                <span className="font-bold text-green-400">{flags.filter(f => f.isEnabled).length}</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 transition-all duration-1000" 
                                    style={{ width: `${(flags.filter(f => f.isEnabled).length / flags.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-800 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                    <ShieldCheck className="h-4 w-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Status</p>
                                    <p className="text-xs font-bold text-zinc-200">System Stabilized</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                    <Activity className="h-4 w-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Last Update</p>
                                    <p className="text-xs font-bold text-zinc-200">Just Now</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Management Hub */}
                <div className="md:col-span-3 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by feature name or system key..."
                                className="pl-10 h-10 border-none bg-muted/50 focus-visible:ring-1"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredFlags.map((flag, index) => {
                                const remainingDays = getRemainingDays(flag.endDate);
                                const isExpired = remainingDays !== null && remainingDays <= 0;
                                
                                return (
                                    <motion.div
                                        key={flag.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className={`group transition-all duration-300 hover:shadow-md border-l-4 ${flag.isEnabled ? (isExpired ? 'border-l-red-500' : 'border-l-green-500') : 'border-l-zinc-300 hover:border-l-zinc-400'}`}>
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-6">
                                                    <div className="flex flex-1 gap-5">
                                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${flag.isEnabled ? (isExpired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600') : 'bg-zinc-50 text-zinc-400'}`}>
                                                            <Settings2 className="h-6 w-6" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-lg tracking-tight">{flag.name}</h3>
                                                                {flag.isEnabled ? (
                                                                    isExpired ? (
                                                                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                                                                            <Clock className="h-3 w-3 mr-1" /> Expired
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                                                                        </Badge>
                                                                    )
                                                                ) : (
                                                                    <Badge variant="outline" className="text-zinc-500 border-zinc-200 bg-zinc-50">
                                                                        <XCircle className="h-3 w-3 mr-1" /> Inactive
                                                                    </Badge>
                                                                )}

                                                                {flag.isEnabled && !isExpired && remainingDays !== null && (
                                                                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                                                        <Hourglass className="h-3 w-3 mr-1" /> {remainingDays} days remaining
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground line-clamp-1">{flag.description || "No description provided for this capability."}</p>
                                                            
                                                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-full">
                                                                    <Lock className="h-3 w-3" />
                                                                    {flag.key}
                                                                </div>
                                                                
                                                                {flag.startDate && flag.endDate && (
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium bg-blue-50/50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {new Date(flag.startDate).toLocaleDateString()} - {new Date(flag.endDate).toLocaleDateString()}
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                                    <Users className="h-3 w-3" />
                                                                    {flag.targetRoles.length > 0 ? flag.targetRoles.join(', ') : 'All Roles'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between md:justify-end gap-6 bg-muted/10 md:bg-transparent p-3 md:p-0 rounded-xl">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Governance State</span>
                                                            <Switch
                                                                checked={flag.isEnabled}
                                                                onCheckedChange={() => handleToggle(flag.id, flag.isEnabled)}
                                                                className="data-[state=checked]:bg-green-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {filteredFlags.length === 0 && (
                            <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-muted/10">
                                <Settings2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-muted-foreground">No matching features found</h3>
                                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-1">Try adjusting your search criteria or define a new system capability.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
