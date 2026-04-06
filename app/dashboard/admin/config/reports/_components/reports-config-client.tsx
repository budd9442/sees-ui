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
    FileText,
    Settings,
    Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ReportTemplate, ReportSection } from '@/types';
import {
    createAdminReportTemplate,
    updateAdminReportTemplate,
    deleteAdminReportTemplate,
} from '@/lib/actions/admin-actions';

const generateId = () => `TMPL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function ReportsConfigClient({ initialData }: { initialData: any }) {
    const { user } = useAuthStore();
    const [reportTemplates, setReportTemplates] = useState(initialData.templates || []);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
    const [templateData, setTemplateData] = useState<ReportTemplate>({
        id: '', name: '', description: '', category: 'performance', sections: [], layout: 'portrait', isActive: true, createdAt: '', updatedAt: '',
    });
    const [newSection, setNewSection] = useState<ReportSection>({
        id: generateId(), title: '', type: 'text', dataFields: [], chartType: 'bar', position: 1,
    });

    const resetForm = () => {
        setEditingTemplate(null);
        setTemplateData({ id: '', name: '', description: '', category: 'performance', sections: [], layout: 'portrait', isActive: true, createdAt: '', updatedAt: '' });
        setNewSection({ id: generateId(), title: '', type: 'text', dataFields: [], chartType: 'bar', position: 1 });
    };

    const handleAddEditTemplate = async () => {
        if (!templateData.name || !templateData.description) {
            toast.error('Please fill in all required fields for the template.');
            return;
        }

        try {
            if (editingTemplate) {
                const updated = { ...templateData, updatedAt: new Date().toISOString() };
                await updateAdminReportTemplate(editingTemplate.id, updated);
                setReportTemplates(reportTemplates.map((t: any) => t.id === editingTemplate.id ? updated : t));
                toast.success('Report template updated successfully!');
            } else {
                const newTemplate = { ...templateData, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
                await createAdminReportTemplate(newTemplate);
                setReportTemplates([...reportTemplates, newTemplate]);
                toast.success('Report template added successfully!');
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (e: any) {
            toast.error('Failed to save report template.');
        }
    };

    const handleEditClick = (template: ReportTemplate) => {
        setEditingTemplate(template);
        setTemplateData({ ...template });
        setIsDialogOpen(true);
    };

    const handleDeleteClick = async (templateId: string) => {
        if (confirm('Are you sure you want to delete this report template?')) {
            try {
                await deleteAdminReportTemplate(templateId);
                setReportTemplates(reportTemplates.filter((t: any) => t.id !== templateId));
                toast.success('Report template deleted.');
            } catch (e: any) {
                toast.error('Failed to delete report template.');
            }
        }
    };

    const handleAddSection = () => {
        if (!newSection.title || (newSection.type === 'text' && newSection.dataFields.length === 0) || (newSection.type === 'chart' && !newSection.chartType)) {
            toast.error('Please fill in all required fields for the new section.');
            return;
        }
        setTemplateData(prev => ({
            ...prev,
            sections: [...prev.sections, { ...newSection, id: generateId() }],
        }));
        setNewSection({ id: generateId(), title: '', type: 'text', dataFields: [], chartType: 'bar', position: templateData.sections.length + 1 });
        toast.success('Section added to template.');
    };

    const handleRemoveSection = (sectionId: string) => {
        setTemplateData(prev => ({
            ...prev,
            sections: prev.sections.filter(sec => sec.id !== sectionId),
        }));
        toast.info('Section removed from template.');
    };

    const handlePreviewTemplate = (template: ReportTemplate) => {
        toast.info(`Previewing template: ${template.name}. (Mock preview)`);
        console.log('Previewing template:', template);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Report Templates Configuration</h1>
                    <p className="text-muted-foreground mt-1">Manage templates for various downloadable reports.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" />Create New Template</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader><DialogTitle>{editingTemplate ? 'Edit Report Template' : 'Create New Report Template'}</DialogTitle><DialogDescription>Define the structure and content for your reports.</DialogDescription></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="template-name" className="text-right">Template Name</Label><Input id="template-name" value={templateData.name} onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })} className="col-span-3" /></div>
                            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="template-description" className="text-right">Description</Label><Textarea id="template-description" value={templateData.description} onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })} className="col-span-3" rows={3} /></div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="template-category" className="text-right">Category</Label>
                                <Select value={templateData.category} onValueChange={(value) => setTemplateData({ ...templateData, category: value as ReportTemplate['category'] })}>
                                    <SelectTrigger id="template-category" className="col-span-3"><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent><SelectItem value="performance">Performance</SelectItem><SelectItem value="pathway">Pathway</SelectItem><SelectItem value="module">Module</SelectItem><SelectItem value="student">Student</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="template-layout" className="text-right">Layout</Label>
                                <Select value={templateData.layout} onValueChange={(value) => setTemplateData({ ...templateData, layout: value as ReportTemplate['layout'] })}>
                                    <SelectTrigger id="template-layout" className="col-span-3"><SelectValue placeholder="Select layout" /></SelectTrigger>
                                    <SelectContent><SelectItem value="portrait">Portrait</SelectItem><SelectItem value="landscape">Landscape</SelectItem></SelectContent>
                                </Select>
                            </div>

                            <h3 className="text-lg font-semibold mt-4 col-span-4">Template Sections</h3>
                            <div className="col-span-4 space-y-3">
                                {templateData.sections.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center">No sections added yet.</p>
                                ) : (
                                    templateData.sections.map((section, index) => (
                                        <div key={section.id} className="flex items-center justify-between p-3 border rounded-md bg-secondary/20">
                                            <div>
                                                <p className="font-medium">{index + 1}. {section.title} ({section.type})</p>
                                                {section.type === 'chart' && <p className="text-sm text-muted-foreground">Chart: {section.chartType}</p>}
                                                {section.dataFields.length > 0 && <p className="text-sm text-muted-foreground">Data Fields: {section.dataFields.join(', ')}</p>}
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveSection(section.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="col-span-4 border-t pt-4 mt-4 space-y-3">
                                <h4 className="text-md font-semibold">Add New Section</h4>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="section-title" className="text-right">Section Title</Label><Input id="section-title" value={newSection.title} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} className="col-span-3" /></div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="section-type" className="text-right">Section Type</Label>
                                    <Select value={newSection.type} onValueChange={(value) => setNewSection({ ...newSection, type: value as ReportSection['type'] })}>
                                        <SelectTrigger id="section-type" className="col-span-3"><SelectValue placeholder="Select section type" /></SelectTrigger>
                                        <SelectContent><SelectItem value="text">Text Content</SelectItem><SelectItem value="table">Table</SelectItem><SelectItem value="chart">Chart</SelectItem><SelectItem value="summary">Summary</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                {newSection.type === 'chart' && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="section-chartType" className="text-right">Chart Type</Label>
                                        <Select value={newSection.chartType} onValueChange={(value) => setNewSection({ ...newSection, chartType: value as ReportSection['chartType'] })}>
                                            <SelectTrigger id="section-chartType" className="col-span-3"><SelectValue placeholder="Select chart type" /></SelectTrigger>
                                            <SelectContent><SelectItem value="bar">Bar Chart</SelectItem><SelectItem value="line">Line Chart</SelectItem><SelectItem value="pie">Pie Chart</SelectItem><SelectItem value="area">Area Chart</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="section-dataFields" className="text-right">Data Fields</Label>
                                    <Input id="section-dataFields" value={newSection.dataFields.join(', ')} onChange={(e) => setNewSection({ ...newSection, dataFields: e.target.value.split(',').map(f => f.trim()).filter(f => f) })} className="col-span-3" placeholder="e.g., studentGrades, modulePerformance" />
                                </div>
                                <div className="flex justify-end"><Button variant="outline" onClick={handleAddSection}><Plus className="mr-2 h-4 w-4" />Add Section</Button></div>
                            </div>
                        </div>
                        <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleAddEditTemplate}><Settings className="mr-2 h-4 w-4" />{editingTemplate ? 'Save Changes' : 'Create Template'}</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader><CardTitle>Existing Report Templates</CardTitle><CardDescription>Configure, edit, or delete report templates.</CardDescription></CardHeader>
                <CardContent>
                    {reportTemplates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4" /><p>No report templates created yet.</p><Button onClick={() => setIsDialogOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> Create First Template</Button></div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Template Name</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Layout</TableHead><TableHead>Sections</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {reportTemplates.map((template: ReportTemplate) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">{template.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{template.description}</TableCell>
                                        <TableCell className="capitalize">{template.category}</TableCell>
                                        <TableCell className="capitalize">{template.layout}</TableCell>
                                        <TableCell>{template.sections.length}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handlePreviewTemplate(template)}><Eye className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(template)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(template.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
