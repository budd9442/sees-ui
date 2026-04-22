import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 to-slate-50">
            <Card className="max-w-md w-full shadow-2xl border-t-4 border-t-yellow-500 overflow-hidden">
                <div className="bg-yellow-50/50 p-8 flex justify-center">
                    <div className="bg-yellow-100 p-4 rounded-full">
                        <ShieldAlert className="h-16 w-16 text-yellow-600 animate-pulse" />
                    </div>
                </div>
                <CardHeader className="text-center pt-2">
                    <CardTitle className="text-3xl font-black text-slate-800 tracking-tight">System Lockdown</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Platform Maintenance in Progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <div className="bg-slate-100/50 rounded-xl p-4 border border-slate-200">
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                            "SEES has been placed in Maintenance Mode by Administration. Please check back later."
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/login">Return to Login</Link>
                        </Button>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
