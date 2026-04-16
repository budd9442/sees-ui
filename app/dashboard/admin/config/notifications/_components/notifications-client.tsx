'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Edit, Trash2, MessageSquare, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { NotificationTemplate, NotificationTriggerRow } from '@/types';
import {
    createAdminNotificationTemplate,
    updateAdminNotificationTemplate,
    deleteAdminNotificationTemplate,
    previewAdminNotificationTemplate,
    updateNotificationTriggerEnabled,
    updateDeadlineReminderConfig,
} from '@/lib/actions/admin-actions';
import { NotificationEventKey } from '@/lib/notifications/events';

const TRIGGER_LABELS: Record<string, string> = {
    [NotificationEventKey.GRADE_RELEASED]: 'Grade released',
    [NotificationEventKey.ACADEMIC_CLASS_CHANGED]: 'Study level changed (e.g. L1 → L2)',
    [NotificationEventKey.ACADEMIC_STANDING_CHANGED]: 'Academic standing changed after grade release (GPA)',
    [NotificationEventKey.ENROLLMENT_WELCOME]: 'Enrollment — welcome with credentials',
    [NotificationEventKey.DEADLINE_REMINDER]: 'Deadline reminders (module reg & selection)',
    [NotificationEventKey.MODULE_REGISTRATION_OPENED]: 'Module registration — window just opened',
    [NotificationEventKey.PATHWAY_SELECTION_OPENED]: 'Pathway selection — window just opened',
    [NotificationEventKey.SPECIALIZATION_SELECTION_OPENED]: 'Specialization selection — window just opened',
    [NotificationEventKey.PATHWAY_ALLOCATED]: 'Pathway allocation updates',
    [NotificationEventKey.SYSTEM_ALERT]: 'System alerts',
};

const PLACEHOLDER_BY_CATEGORY: Record<NotificationTemplate['category'], string[]> = {
    grade_release: ['{{studentName}}', '{{moduleName}}', '{{moduleCode}}', '{{letterGrade}}'],
    academic_class_change: ['{{studentName}}', '{{previousLevel}}', '{{newLevel}}'],
    academic_standing_changed: [
        '{{studentName}}',
        '{{previousAcademicStanding}}',
        '{{newAcademicStanding}}',
        '{{currentGpa}}',
    ],
    enrollment_welcome: ['{{firstName}}', '{{username}}', '{{tempPassword}}', '{{loginUrl}}'],
    deadline_reminder: ['{{studentName}}', '{{deadlineTitle}}', '{{deadlineDate}}', '{{extraMessage}}'],
    module_registration_opened: ['{{studentName}}', '{{windowLabel}}', '{{closesAt}}', '{{extraMessage}}'],
    pathway_selection_opened: ['{{studentName}}', '{{windowLabel}}', '{{level}}', '{{closesAt}}', '{{extraMessage}}'],
    specialization_selection_opened: ['{{studentName}}', '{{windowLabel}}', '{{level}}', '{{closesAt}}', '{{extraMessage}}'],
    pathway_allocated: ['{{studentName}}', '{{outcome}}'],
    system_alert: ['{{alertTitle}}', '{{alertBody}}'],
};

export type NotificationsInitialData = {
    templates: NotificationTemplate[];
    triggers: NotificationTriggerRow[];
};

export default function NotificationsClient({ initialData }: { initialData: NotificationsInitialData }) {
    const [notificationTemplates, setNotificationTemplates] = useState(initialData.templates || []);
    const [triggers, setTriggers] = useState<NotificationTriggerRow[]>(initialData.triggers || []);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [previewSubject, setPreviewSubject] = useState('');

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

    const deadlineTrigger = triggers.find((t) => t.eventKey === NotificationEventKey.DEADLINE_REMINDER);
    const daysBefore = (deadlineTrigger?.configJson?.daysBeforeClose ?? [1, 3]).join(', ');

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
                const res = await updateAdminNotificationTemplate(editingTemplate.id, {
                    ...templateData,
                    updatedAt: new Date().toISOString(),
                });
                if (res.success && res.data) {
                    setNotificationTemplates(notificationTemplates.map((t) => (t.id === editingTemplate.id ? res.data! : t)));
                    toast.success('Notification template updated successfully!');
                }
            } else {
                const res = await createAdminNotificationTemplate({
                    name: templateData.name,
                    category: templateData.category,
                    subject: templateData.subject,
                    body: templateData.body,
                    placeholders: templateData.placeholders,
                    isActive: templateData.isActive,
                });
                if (res.success && res.data) {
                    setNotificationTemplates([...notificationTemplates, res.data]);
                    toast.success('Notification template added successfully!');
                }
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Failed to save notification template.');
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
                setNotificationTemplates(notificationTemplates.filter((t) => t.id !== templateId));
                toast.success('Notification template deleted.');
            } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : 'Failed to delete template.');
            }
        }
    };

    const handlePreviewTemplate = async (template: NotificationTemplate) => {
        try {
            const res = await previewAdminNotificationTemplate(template.id);
            if (res.success) {
                setPreviewSubject(res.subject);
                setPreviewHtml(res.html);
                setPreviewOpen(true);
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Preview failed');
        }
    };

    const toggleTrigger = async (eventKey: string, enabled: boolean) => {
        try {
            await updateNotificationTriggerEnabled(eventKey, enabled);
            setTriggers((prev) => prev.map((t) => (t.eventKey === eventKey ? { ...t, enabled } : t)));
            toast.success(enabled ? 'Trigger enabled' : 'Trigger disabled');
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Failed to update trigger');
        }
    };

    const saveDeadlineDays = async (raw: string) => {
        const parts = raw
            .split(/[, ]+/)
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !Number.isNaN(n));
        try {
            const res = await updateDeadlineReminderConfig(parts);
            if (res.success) {
                setTriggers((prev) =>
                    prev.map((t) =>
                        t.eventKey === NotificationEventKey.DEADLINE_REMINDER
                            ? { ...t, configJson: { daysBeforeClose: res.daysBeforeClose } }
                            : t
                    )
                );
                toast.success('Deadline reminder schedule updated');
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Invalid days');
        }
    };

    const getCategoryColor = (category: NotificationTemplate['category']) => {
        switch (category) {
            case 'grade_release':
                return 'bg-blue-100 text-blue-800';
            case 'academic_class_change':
                return 'bg-purple-100 text-purple-800';
            case 'academic_standing_changed':
                return 'bg-indigo-100 text-indigo-800';
            case 'enrollment_welcome':
                return 'bg-emerald-100 text-emerald-800';
            case 'pathway_allocated':
                return 'bg-green-100 text-green-800';
            case 'deadline_reminder':
                return 'bg-orange-100 text-orange-800';
            case 'module_registration_opened':
            case 'pathway_selection_opened':
            case 'specialization_selection_opened':
                return 'bg-cyan-100 text-cyan-800';
            case 'system_alert':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const categoryPlaceholders = PLACEHOLDER_BY_CATEGORY[templateData.category] ?? [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Notification Templates</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure email notifications for academic events. Delivery uses Brevo (transactional).
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" /> Create New Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingTemplate ? 'Edit Notification Template' : 'Create New Notification Template'}</DialogTitle>
                            <DialogDescription>
                                One active template per event type is used (latest updated). Disable triggers below without deleting text.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="template-name" className="text-right">
                                    Template Name
                                </Label>
                                <Input
                                    id="template-name"
                                    value={templateData.name}
                                    onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="template-category" className="text-right">
                                    Category
                                </Label>
                                <Select
                                    value={templateData.category}
                                    onValueChange={(value) =>
                                        setTemplateData({
                                            ...templateData,
                                            category: value as NotificationTemplate['category'],
                                            placeholders: [],
                                        })
                                    }
                                >
                                    <SelectTrigger id="template-category" className="col-span-3">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="grade_release">Grade Release</SelectItem>
                                        <SelectItem value="academic_class_change">Study level change (L1 → L2)</SelectItem>
                                        <SelectItem value="academic_standing_changed">Academic standing (GPA) after release</SelectItem>
                                        <SelectItem value="enrollment_welcome">Enrollment Welcome</SelectItem>
                                        <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                                        <SelectItem value="module_registration_opened">Module registration opened</SelectItem>
                                        <SelectItem value="pathway_selection_opened">Pathway selection opened</SelectItem>
                                        <SelectItem value="specialization_selection_opened">Specialization selection opened</SelectItem>
                                        <SelectItem value="pathway_allocated">Pathway Allocated</SelectItem>
                                        <SelectItem value="system_alert">System Alert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="template-subject" className="text-right">
                                    Subject Line
                                </Label>
                                <Input
                                    id="template-subject"
                                    value={templateData.subject}
                                    onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                                    className="col-span-3"
                                    placeholder="e.g., Your grades for {{moduleName}} have been released"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="template-body" className="text-right">
                                    Message Body
                                </Label>
                                <Textarea
                                    id="template-body"
                                    value={templateData.body}
                                    onChange={(e) => setTemplateData({ ...templateData, body: e.target.value })}
                                    className="col-span-3"
                                    rows={8}
                                    placeholder="Plain text; use {{placeholders}} from the list below."
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Placeholders</Label>
                                <div className="col-span-3">
                                    <div className="flex flex-wrap gap-2">
                                        {categoryPlaceholders.map((placeholder) => (
                                            <Button
                                                key={placeholder}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const has = templateData.placeholders.includes(placeholder);
                                                    setTemplateData({
                                                        ...templateData,
                                                        placeholders: has
                                                            ? templateData.placeholders.filter((p) => p !== placeholder)
                                                            : [...templateData.placeholders, placeholder],
                                                    });
                                                }}
                                                className={templateData.placeholders.includes(placeholder) ? 'bg-blue-100' : ''}
                                            >
                                                {placeholder}
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Tagging is optional metadata; the body may include any <code>{'{{key}}'}</code> you pass at send time.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="template-active" className="text-right">
                                    Active
                                </Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Switch
                                        id="template-active"
                                        checked={templateData.isActive}
                                        onCheckedChange={(c) => setTemplateData({ ...templateData, isActive: c })}
                                    />
                                    <Label htmlFor="template-active">Use this template when sending (per event)</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddEditTemplate}>
                                <Save className="mr-2 h-4 w-4" />
                                {editingTemplate ? 'Save Changes' : 'Create Template'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Email triggers</CardTitle>
                    <CardDescription>Turn categories on or off globally. Templates must exist and be active to send.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {triggers.map((t) => (
                        <div key={t.eventKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 last:border-0">
                            <div>
                                <p className="font-medium">{TRIGGER_LABELS[t.eventKey] ?? t.eventKey}</p>
                                <p className="text-xs text-muted-foreground font-mono">{t.eventKey}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{t.enabled ? 'On' : 'Off'}</span>
                                <Switch checked={t.enabled} onCheckedChange={(c) => toggleTrigger(t.eventKey, c)} />
                            </div>
                        </div>
                    ))}
                    <div className="pt-2 space-y-2">
                        <Label>Deadline reminder — days before close (comma-separated)</Label>
                        <div className="flex gap-2 max-w-md">
                            <Input
                                key={daysBefore}
                                defaultValue={daysBefore}
                                id="deadline-days"
                                placeholder="1, 3, 7"
                                onBlur={(e) => saveDeadlineDays(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Cron should call <code className="text-xs">/api/cron/deadline-reminders</code> daily (with{' '}
                            <code>CRON_SECRET</code>).
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notification Templates</CardTitle>
                    <CardDescription>Manage email copy per event. Multiple rows per event allowed; latest active wins.</CardDescription>
                </CardHeader>
                <CardContent>
                    {notificationTemplates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                            <p>No notification templates created yet.</p>
                            <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                                <Plus className="mr-2 h-4 w-4" /> Create First Template
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Template Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Placeholders</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notificationTemplates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">{template.name}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}
                                            >
                                                {template.category.replace(/_/g, ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {template.placeholders.slice(0, 3).map((placeholder: string) => (
                                                    <span key={placeholder} className="text-xs bg-gray-100 px-1 rounded">
                                                        {placeholder}
                                                    </span>
                                                ))}
                                                {template.placeholders.length > 3 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        +{template.placeholders.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {template.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handlePreviewTemplate(template)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(template)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(template.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notificationTemplates.length}</div>
                        <p className="text-xs text-muted-foreground">All templates</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {notificationTemplates.filter((t) => t.isActive).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Grade Templates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {notificationTemplates.filter((t) => t.category === 'grade_release').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Grade-related</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Triggers On</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{triggers.filter((t) => t.enabled).length}</div>
                        <p className="text-xs text-muted-foreground">Enabled events</p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Preview</DialogTitle>
                        <DialogDescription>{previewSubject}</DialogDescription>
                    </DialogHeader>
                    <iframe title="email-preview" className="w-full flex-1 min-h-[400px] border rounded-md bg-white" srcDoc={previewHtml} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
