'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Edit,
    Trash2,
    MessageSquare,
    Eye,
    Save,
} from 'lucide-react';
import { toast } from 'sonner';
import type { NotificationTemplate } from '@/types';
import {
    createAdminNotificationTemplate,
    updateAdminNotificationTemplate,
    deleteAdminNotificationTemplate,
} from '@/lib/actions/admin-actions';

export default function NotificationsClient({ initialData }: { initialData: any }) {
    const { user } = useAuthStore();
    const [notificationTemplates, setNotificationTemplates] = useState(initialData.templates || []);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
    const [templateData, setTemplateData] = useState<NotificationTemplate>({
        id: '',
        name: '',
        category: 'grade_release',
        subject: '',
        body: '',
        placeholders: [],
        isActive: true,
        createdAt: '',
        updatedAt: '',
    });

    const resetForm = () => {
        setEditingTemplate(null);
        setTemplateData({
            id: '',
            name: '',
            category: 'grade_release',
            subject: '',
            body: '',
            placeholders: [],
            isActive: true,
            createdAt: '',
            updatedAt: '',
        });
    };

    const handleAddEditTemplate = async () => {
        if (!templateData.name || !templateData.subject || !templateData.body) {
            toast.error('Please fill in all required fields.');
            return;
        }

        try {
            if (editingTemplate) {
                const updated = { ...templateData, updatedAt: new Date().toISOString() };
                await updateAdminNotificationTemplate(editingTemplate.id, updated);
                setNotificationTemplates(notificationTemplates.map((t: any) => t.id === editingTemplate.id ? updated : t));
                toast.success('Notification template updated successfully!');
            } else {
                const newTemplate = {
                    ...templateData,
                    id: `TMPL${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                await createAdminNotificationTemplate(newTemplate);
                setNotificationTemplates([...notificationTemplates, newTemplate]);
                toast.success('Notification template added successfully!');
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (e: any) {
            toast.error('Failed to save notification template.');
        }
    };

    const handleEditClick = (template: NotificationTemplate) => {
        setEditingTemplate(template);
        setTemplateData({ ...template });
        setIsDialogOpen(true);
    };

    const handleDeleteClick = async (templateId: string) => {
        if (confirm('Are you sure you want to delete this notification template?')) {
            try {
                await deleteAdminNotificationTemplate(templateId);
                setNotificationTemplates(notificationTemplates.filter((t: any) => t.id !== templateId));
                toast.success('Notification template deleted.');
            } catch (e: any) {
                toast.error('Failed to delete template.');
            }
        }
    };

    const handlePreviewTemplate = (template: NotificationTemplate) => {
        toast.info(`Previewing template: ${template.name}. (Mock preview)`);
        console.log('Previewing template:', template);
    };

    const getCategoryColor = (category: NotificationTemplate['category']) => {
        switch (category) {
            case 'grade_release': return 'bg-blue-100 text-blue-800';
            case 'gpa_change': return 'bg-yellow-100 text-yellow-800';
            case 'pathway_allocated': return 'bg-green-100 text-green-800';
            case 'deadline_reminder': return 'bg-orange-100 text-orange-800';
            case 'system_alert': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Notification Templates</h1>
                    <p className="text-muted-foreground mt-1">Manage email and system notification templates for various events.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Create New Template</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader><DialogTitle>{editingTemplate ? 'Edit Notification Template' : 'Create New Notification Template'}</DialogTitle><DialogDescription>Define the content and triggers for your notification template.</DialogDescription></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="template-name" className="text-right">Template Name</Label><Input id="template-name" value={templateData.name} onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })} className="col-span-3" /></div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="template-category" className="text-right">Category</Label>
                                <Select value={templateData.category} onValueChange={(value) => setTemplateData({ ...templateData, category: value as NotificationTemplate['category'] })}>
                                    <SelectTrigger id="template-category" className="col-span-3"><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="grade_release">Grade Release</SelectItem>
                                        <SelectItem value="gpa_change">GPA Change</SelectItem>
                                        <SelectItem value="pathway_allocated">Pathway Allocated</SelectItem>
                                        <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                                        <SelectItem value="system_alert">System Alert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="template-subject" className="text-right">Subject Line</Label>
                                <Input id="template-subject" value={templateData.subject} onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })} className="col-span-3" placeholder="e.g., Your grades for {{moduleName}} have been released" />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="template-body" className="text-right">Message Body</Label>
                                <Textarea id="template-body" value={templateData.body} onChange={(e) => setTemplateData({ ...templateData, body: e.target.value })} className="col-span-3" rows={8} placeholder="Dear {{studentName}},\n\nYour message here...\n\nBest regards,\nAcademic Team" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="template-placeholders" className="text-right">Available Placeholders</Label>
                                <div className="col-span-3">
                                    <div className="flex flex-wrap gap-2">
                                        {['{{studentName}}', '{{moduleName}}', '{{grade}}', '{{gpa}}', '{{pathway}}', '{{deadline}}'].map((placeholder) => (
                                            <Button key={placeholder} variant="outline" size="sm" onClick={() => { const newPlaceholders = templateData.placeholders.includes(placeholder) ? templateData.placeholders.filter(p => p !== placeholder) : [...templateData.placeholders, placeholder]; setTemplateData({ ...templateData, placeholders: newPlaceholders }); }} className={templateData.placeholders.includes(placeholder) ? 'bg-blue-100' : ''}>{placeholder}</Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="template-active" className="text-right">Active</Label>
                                <div className="col-span-3">
                                    <input id="template-active" type="checkbox" checked={templateData.isActive} onChange={(e) => setTemplateData({ ...templateData, isActive: e.target.checked })} className="mr-2" />
                                    <Label htmlFor="template-active">Enable this template</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleAddEditTemplate}><Save className="mr-2 h-4 w-4" />{editingTemplate ? 'Save Changes' : 'Create Template'}</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader><CardTitle>Notification Templates</CardTitle><CardDescription>Manage and configure notification templates for different events.</CardDescription></CardHeader>
                <CardContent>
                    {notificationTemplates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground"><MessageSquare className="h-12 w-12 mx-auto mb-4" /><p>No notification templates created yet.</p><Button onClick={() => setIsDialogOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> Create First Template</Button></div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Template Name</TableHead><TableHead>Category</TableHead><TableHead>Subject</TableHead><TableHead>Placeholders</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {notificationTemplates.map((template: any) => (
                                    <TableRow key={template.id}><TableCell className="font-medium">{template.name}</TableCell><TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>{template.category.replace('_', ' ')}</span></TableCell><TableCell className="max-w-xs truncate">{template.subject}</TableCell><TableCell><div className="flex flex-wrap gap-1">{template.placeholders.slice(0, 3).map((placeholder: string) => (<span key={placeholder} className="text-xs bg-gray-100 px-1 rounded">{placeholder}</span>))}{template.placeholders.length > 3 && (<span className="text-xs text-muted-foreground">+{template.placeholders.length - 3} more</span>)}</div></TableCell><TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{template.isActive ? 'Active' : 'Inactive'}</span></TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="icon" onClick={() => handlePreviewTemplate(template)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleEditClick(template)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteClick(template.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Templates</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{notificationTemplates.length}</div><p className="text-xs text-muted-foreground">All templates</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Active Templates</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{notificationTemplates.filter((t: any) => t.isActive).length}</div><p className="text-xs text-muted-foreground">Currently active</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Grade Templates</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{notificationTemplates.filter((t: any) => t.category === 'grade_release').length}</div><p className="text-xs text-muted-foreground">Grade-related</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">System Templates</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{notificationTemplates.filter((t: any) => t.category === 'system_alert').length}</div><p className="text-xs text-muted-foreground">System alerts</p></CardContent></Card>
            </div>
        </div>
    );
}
