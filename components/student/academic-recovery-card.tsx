'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    AlertCircle, 
    ArrowRight, 
    Calendar, 
    CheckCircle, 
    GraduationCap, 
    History, 
    LayoutDashboard, 
    Lightbulb, 
    Loader2, 
    Mail, 
    MessageCircle, 
    ShieldAlert, 
    Sparkles, 
    Star, 
    TrendingDown, 
    UserIcon, 
    Users 
} from 'lucide-react';
import { getAcademicRecoveryData } from '@/lib/actions/monitoring-actions';
import { toast } from 'sonner';

export function AcademicRecoveryCard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function fetchSupport() {
            setLoading(true);
            try {
                const res = await getAcademicRecoveryData();
                if (res.dipDetected) {
                    setData(res);
                }
            } catch (err) {
                console.error("Monitoring check failed", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSupport();
    }, []);

    if (loading) return null;
    if (!data) return null;

    const { trend, advice, advisor } = data;

    const handleMessageAdvisor = () => {
        // Pre-fill a message for the advisor in local storage or state
        localStorage.setItem('advisor_subject_draft', advice.advisor_outreach_subject);
        localStorage.setItem('advisor_body_draft', advice.advisor_outreach_body);
        window.location.href = `/dashboard/student/messages?recipient=${advisor?.user_id}`;
    };

    return (
        <Card className="border-amber-200 bg-amber-50/50 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
            <CardHeader className="bg-amber-100/50 rounded-t-xl border-b border-amber-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-amber-900">Academic Support & Recovery</CardTitle>
                            <CardDescription className="text-amber-700 flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                We've noticed a change in your GPA trajectory this semester.
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-white text-amber-700 border-amber-200">
                        Dip Detected: -{trend.dipAmount.toFixed(2)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="py-6 space-y-6">
                {/* Empathetic AI Message */}
                <div className="relative p-5 bg-white border border-amber-100 rounded-2xl shadow-sm">
                    <Sparkles className="absolute top-2 right-2 h-5 w-5 text-amber-400 opacity-50" />
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm leading-relaxed text-slate-800 italic">
                            "{advice.message}"
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Recovery Roadmap */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Recovery Roadmap
                        </h4>
                        <ul className="space-y-2">
                            {advice.recovery_actions.map((action: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-amber-100 text-sm">
                                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                    </div>
                                    <span className="text-slate-700">{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Channels */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Immediate Support
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            <Button variant="outline" className="justify-start bg-white border-amber-200 hover:bg-amber-100" asChild>
                                <a href="/resources/tutoring">
                                    <Star className="h-4 w-4 mr-2 text-amber-500" />
                                    Peer Tutoring Center
                                </a>
                            </Button>
                            <Button variant="outline" className="justify-start bg-white border-amber-200 hover:bg-amber-100" asChild>
                                <a href="/resources/library">
                                    <ArrowRight className="h-4 w-4 mr-2 text-amber-500" />
                                    Library Research Assistant
                                </a>
                            </Button>
                        </div>
                        
                        {advisor && (
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mt-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <UserIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-primary uppercase">Your Advisor</p>
                                        <p className="text-sm font-medium">{advisor.firstName} {advisor.lastName}</p>
                                    </div>
                                </div>
                                <Button className="w-full bg-primary" onClick={handleMessageAdvisor}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Reach Out for Guidance
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 rounded-b-xl border-t text-[10px] text-muted-foreground flex justify-between items-center py-2 px-6">
                <span>Personalized Support Policy: Your recovery data is only visible to you and your advisor.</span>
                <div className="flex items-center gap-1">
                    <History className="h-3 w-3" />
                    Last Analysis: {new Array().length === 0 ? "Real-time" : "Today"}
                </div>
            </CardFooter>
        </Card>
    );
}
