'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Database, 
    Download, 
    History, 
    RefreshCcw, 
    Save, 
    Trash2, 
    CheckCircle2, 
    AlertTriangle,
    FileJson,
    HardDrive
} from 'lucide-react';
import { triggerBackup, getBackupsList, deleteBackup } from '@/lib/actions/backup-actions';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function BackupsPage() {
    const [backups, setBackups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const list = await getBackupsList();
            setBackups(list);
        } catch (err) {
            toast.error("Failed to load backups.");
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerBackup = async () => {
        setWorking(true);
        try {
            await triggerBackup();
            toast.success("Snapshot created successfully.");
            await fetchBackups();
        } catch (err) {
            toast.error("Backup failed.");
        } finally {
            setWorking(false);
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm("Are you sure you want to delete this backup?")) return;
        try {
            await deleteBackup(filename);
            toast.success("Backup deleted.");
            await fetchBackups();
        } catch (err) {
            toast.error("Delete failed.");
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Data Persistence & Backups</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Manage system snapshots and recovery historical data.</p>
                </div>
                <Button onClick={handleTriggerBackup} disabled={working} className="shadow-lg hover:shadow-xl transition-all">
                    {working ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Generate New Snapshot
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Data Safety Level
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Optimal</div>
                        <p className="text-xs text-muted-foreground">System has {backups.length} valid snapshots.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-primary" />
                            Storage Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatSize(backups.reduce((sum, b) => sum + b.size, 0))}
                        </div>
                        <p className="text-xs text-muted-foreground">Local JSON Storage</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <History className="h-4 w-4 text-orange-500" />
                            Last Backup
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {backups.length > 0 ? format(new Date(backups[0].createdAt), 'MMM dd, HH:mm') : 'None'}
                        </div>
                        <p className="text-xs text-muted-foreground">UTC-based timestamp</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-slate-500" />
                            <CardTitle>Snapshot History</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-white">{backups.length} Files</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-4 opacity-20" />
                            Scanning storage...
                        </div>
                    ) : backups.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-orange-400" />
                            No snapshots found. Generate your first backup above.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50 text-slate-500 h-10 border-b">
                                <tr>
                                    <th className="text-left pl-6 font-medium">Backup File</th>
                                    <th className="text-left font-medium">Size</th>
                                    <th className="text-left font-medium">Created At</th>
                                    <th className="text-right pr-6 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {backups.map((backup) => (
                                    <tr key={backup.filename} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <FileJson className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <span className="font-medium font-mono text-xs">{backup.filename}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-600 italic">{formatSize(backup.size)}</td>
                                        <td className="py-4 text-slate-600">{format(new Date(backup.createdAt), 'yyyy-MM-dd HH:mm:ss')}</td>
                                        <td className="py-4 pr-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="outline" size="sm" className="h-8" disabled>
                                                    <Download className="h-3 w-3 mr-2" /> Download
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(backup.filename)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
                <CardFooter className="bg-slate-50/30 border-t py-2 px-6">
                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Note: For current demo, 'Download' is restricted to local server filesystem.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
