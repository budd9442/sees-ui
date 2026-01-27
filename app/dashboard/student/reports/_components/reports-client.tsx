'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ReportsClient() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        type: 'feedback',
        content: ''
    });

    const handleSubmit = async () => {
        if (!formData.subject || !formData.content) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Report submitted successfully");
            setFormData({ subject: '', type: 'feedback', content: '' });
        }, 1000);
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <PageHeader title="Anonymous Reports" description="Submit feedback or report issues confidentially" />

            <Card>
                <CardHeader>
                    <CardTitle>New Report</CardTitle>
                    <CardDescription>
                        Your identity will be protected. Please provide as much detail as possible.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                placeholder="Brief summary"
                                value={formData.subject}
                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={formData.type} onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="feedback">General Feedback</SelectItem>
                                    <SelectItem value="complaint">Complaint</SelectItem>
                                    <SelectItem value="suggestion">Suggestion</SelectItem>
                                    <SelectItem value="security">Security Concern</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Details</Label>
                        <Textarea
                            placeholder="Describe your concern or feedback..."
                            rows={6}
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        />
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
