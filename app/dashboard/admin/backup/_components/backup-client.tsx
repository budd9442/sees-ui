'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Plus,
    Download,
    Upload,
    RefreshCw,
    History,
    Database,
    CheckCircle2,
    AlertCircle,
    Loader2,
    FileText,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Backup } from '@/types';
import { createAdminBackup, deleteAdminBackup, restoreAdminBackup } from '@/lib/actions/admin-actions';

export default function BackupClient({ initialData }: { initialData: any }) {
    const { user } = useAuthStore();
    const [backups, setBackups] = useState(initialData.backups || []);

    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreateBackup = async () => {
        setIsProcessing(true);
        toast.info('Creating new backup...');
        try {
            const res = await createAdminBackup();
            if (res.success && res.backup) {
                setBackups([res.backup, ...backups]);
                toast.success('Backup created successfully!');
            }
        } catch (e: any) {
            toast.error('Failed to create backup.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadBackup = (backup: Backup) => {
        toast.info(`Downloading ${backup.name}...`);
        const backupContent = JSON.stringify({ backup, timestamp: new Date().toISOString() }, null, 2);
        const blob = new Blob([backupContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${backup.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Backup export completed.');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUploadBackup = () => {
        if (!selectedFile) {
            toast.error('Please select a backup file to upload.');
            return;
        }

        setIsProcessing(true);
        toast.info(`Uploading ${selectedFile.name}...`);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const uploadedData = JSON.parse(content);

                if (!uploadedData.students || !uploadedData.modules) {
                    throw new Error('Invalid backup file structure.');
                }

                const newBackup: Backup = {
                    id: `backup_${Date.now()}`,
                    name: selectedFile.name.replace('.json', ''),
                    description: 'Uploaded backup file',
                    type: 'manual',
                    status: 'completed',
                    size: selectedFile.size,
                    createdAt: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                    checksum: Math.random().toString(36).substring(2, 15),
                    downloadUrl: `/backups/${selectedFile.name}`,
                };
                setBackups([newBackup, ...backups]);
                toast.success('Backup file uploaded successfully!');
                setIsUploadDialogOpen(false);
                setSelectedFile(null);
            } catch (error: any) {
                toast.error(`Failed to process backup file: ${error.message}`);
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsText(selectedFile);
    };

    const handleRestoreBackup = async (backup: Backup) => {
        if (!confirm(`Are you sure you want to restore from backup "${backup.name}"? This will overwrite current system data.`)) {
            return;
        }

        setIsProcessing(true);
        toast.info(`Restoring from backup "${backup.name}"...`);

        try {
            await restoreAdminBackup(backup.id);
            toast.success(`System restored from "${backup.name}". Page will now refresh.`);
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (e: any) {
            toast.error('Failed to restore backup.');
            setIsProcessing(false);
        }
    };

    const handleDeleteBackup = async (backupId: string) => {
        if (confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
            try {
                await deleteAdminBackup(backupId);
                setBackups(backups.filter((b: any) => b.id !== backupId));
                toast.success('Backup deleted successfully.');
            } catch (e: any) {
                toast.error('Failed to delete backup.');
            }
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">System Backup & Restore</h1>
                    <p className="text-muted-foreground mt-1">Manage system backups, create new ones, and restore previous states.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleCreateBackup} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Create New Backup
                    </Button>
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setSelectedFile(null)}><Upload className="mr-2 h-4 w-4" /> Upload Backup</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Upload Backup File</DialogTitle><DialogDescription>Upload a previously downloaded backup file to the system.</DialogDescription></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2"><Label htmlFor="backup-file">Backup File (.json)</Label><Input id="backup-file" type="file" accept=".json" onChange={handleFileChange} /></div>
                            </div>
                            <DialogFooter><Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button><Button onClick={handleUploadBackup} disabled={!selectedFile || isProcessing}>{isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Upload</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Backup History</CardTitle><CardDescription>List of all available system backups.</CardDescription></CardHeader>
                <CardContent>
                    {backups.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground"><History className="h-12 w-12 mx-auto mb-4" /><p>No backups found. Create your first backup!</p><Button onClick={handleCreateBackup} className="mt-4" disabled={isProcessing}><Plus className="mr-2 h-4 w-4" /> Create Backup Now</Button></div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Size</TableHead><TableHead>Created At</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {backups.sort((a: Backup, b: Backup) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((backup: Backup) => (
                                    <TableRow key={backup.id}><TableCell className="font-medium">{backup.name}</TableCell><TableCell className="capitalize">{backup.type}</TableCell><TableCell><div className="flex items-center gap-2">{backup.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : backup.status === 'failed' ? <AlertCircle className="h-4 w-4 text-red-500" /> : <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />}<span className="capitalize">{backup.status.replace('_', ' ')}</span></div></TableCell><TableCell>{formatFileSize(backup.size)}</TableCell><TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2">{backup.status === 'completed' && (<><Button variant="ghost" size="icon" onClick={() => handleDownloadBackup(backup)}><Download className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleRestoreBackup(backup)} disabled={isProcessing}><RefreshCw className="h-4 w-4" /></Button></>)}<Button variant="ghost" size="icon" onClick={() => handleDeleteBackup(backup.id)} disabled={isProcessing}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Backups</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{backups.length}</div><p className="text-xs text-muted-foreground">All time</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Successful</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{backups.filter((b: Backup) => b.status === 'completed').length}</div><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Failed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{backups.filter((b: Backup) => b.status === 'failed').length}</div><p className="text-xs text-muted-foreground">Failed</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Automated Backup Settings</CardTitle><CardDescription>Configure automatic backup schedules and retention policies.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2"><Label htmlFor="schedule">Backup Schedule</Label><select id="schedule" className="px-3 py-2 border rounded-md" defaultValue="weekly"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
                    <div className="grid gap-2"><Label htmlFor="retention">Retention Policy (days)</Label><Input id="retention" type="number" defaultValue={30} /></div>
                    <Button variant="secondary"><Database className="mr-2 h-4 w-4" /> Save Settings</Button>
                </CardContent>
            </Card>
        </div>
    );
}
