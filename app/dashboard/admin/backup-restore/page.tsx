'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
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
  Progress,
} from '@/components/ui/progress';
import {
  Download,
  Upload,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Calendar,
  HardDrive,
  Shield,
  FileText,
  Settings,
  RefreshCw,
} from 'lucide-react';
import type { Backup } from '@/types';

// Backup types for selection

const backupTypes = [
  { value: 'full', label: 'Full System Backup', description: 'Complete backup of all data and configurations' },
  { value: 'incremental', label: 'Incremental Backup', description: 'Backup of changes since last full backup' },
  { value: 'differential', label: 'Differential Backup', description: 'Backup of changes since last full backup' },
  { value: 'selective', label: 'Selective Backup', description: 'Backup specific databases or components' }
];

const restoreOptions = [
  { value: 'full', label: 'Full System Restore', description: 'Restore entire system from backup' },
  { value: 'database', label: 'Database Only', description: 'Restore only database components' },
  { value: 'files', label: 'Files Only', description: 'Restore only file system' },
  { value: 'config', label: 'Configuration Only', description: 'Restore only system configuration' }
];

import { getAdminBackupsData, createAdminBackup as performCreateBackup, deleteAdminBackup as performDeleteBackup, restoreAdminBackup as performRestoreBackup } from '@/lib/actions/admin-actions';
import { toast } from 'sonner';

export default function BackupRestorePage() {
  const { user } = useAuthStore();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backupForm, setBackupForm] = useState({
    name: '',
    description: '',
    type: 'full',
    schedule: 'manual'
  });
  const [restoreForm, setRestoreForm] = useState({
    backupId: '',
    restoreType: 'full',
    confirmRestore: false
  });

  const fetchBackups = async () => {
    try {
      const data = await getAdminBackupsData();
      setBackups(data.backups);
    } catch (err) {
      toast.error('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBackups();
    }
  }, [user]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return RefreshCw;
      case 'failed': return AlertTriangle;
      case 'scheduled': return Clock;
      default: return Clock;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'manual': return Settings;
      case 'scheduled': return Calendar;
      case 'system': return Database;
      default: return Database;
    }
  };

  const createBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(10);
    try {
      const result = await performCreateBackup();
      if (result.success) {
        setBackupProgress(100);
        toast.success('Backup created successfully');
        await fetchBackups();
        setShowCreateDialog(false);
      }
    } catch (err) {
      toast.error('Backup creation failed');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const restoreBackup = async () => {
    setIsRestoring(true);
    setRestoreProgress(20);
    try {
      if (selectedBackup) {
        const result = await performRestoreBackup(selectedBackup.id);
        if (result.success) {
          setRestoreProgress(100);
          toast.success('System restored successfully');
          setShowRestoreDialog(false);
        }
      }
    } catch (err) {
      toast.error('System restore failed');
    } finally {
      setIsRestoring(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const result = await performDeleteBackup(backupId);
      if (result.success) {
        toast.success('Backup deleted');
        await fetchBackups();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Backup & Restore</h1>
            <p className="text-gray-600">
              Manage system backups and restore data when needed.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Database className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </div>
        </div>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Total Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {backups.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {backups.filter(b => b.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-green-600" />
              Total Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatFileSize(backups.reduce((acc, backup) => acc + backup.size, 0))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Storage used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {Math.round((backups.filter(b => b.status === 'completed').length / backups.length) * 100)}%
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Backup success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Last Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Most recent backup
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Operations */}
      {(isCreatingBackup || isRestoring) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                  Creating Backup
                </>
              ) : (
                <>
                  <RotateCcw className="h-5 w-5 text-green-600 animate-spin" />
                  Restoring Backup
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{isCreatingBackup ? 'Backup Progress' : 'Restore Progress'}</span>
                  <span>{isCreatingBackup ? backupProgress : restoreProgress}%</span>
                </div>
                <Progress 
                  value={isCreatingBackup ? backupProgress : restoreProgress} 
                  className="w-full"
                />
              </div>
              <p className="text-sm text-gray-600">
                {isCreatingBackup 
                  ? 'Creating backup... Please do not close this page.' 
                  : 'Restoring backup... Please do not close this page.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup History
          </CardTitle>
          <CardDescription>
            View and manage all system backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => {
                const StatusIcon = getStatusIcon(backup.status);
                const TypeIcon = getTypeIcon(backup.type);
                
                return (
                  <TableRow key={backup.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{backup.name}</div>
                        <div className="text-sm text-gray-500">{backup.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-gray-600" />
                        <span className="capitalize">{backup.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(backup.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {backup.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {backup.size > 0 ? formatFileSize(backup.size) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{new Date(backup.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(backup.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {backup.status === 'completed' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedBackup(backup);
                                setShowRestoreDialog(true);
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Backup</DialogTitle>
            <DialogDescription>
              Create a new system backup with your preferred settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="backupName">Backup Name</Label>
              <Input
                id="backupName"
                placeholder="Enter backup name"
                value={backupForm.name}
                onChange={(e) => setBackupForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="backupDescription">Description</Label>
              <Textarea
                id="backupDescription"
                placeholder="Enter backup description"
                value={backupForm.description}
                onChange={(e) => setBackupForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="backupType">Backup Type</Label>
              <Select 
                value={backupForm.type} 
                onValueChange={(value) => setBackupForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {backupTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-600">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createBackup}
              disabled={!backupForm.name || isCreatingBackup}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreatingBackup ? 'Creating...' : 'Create Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore from Backup</DialogTitle>
            <DialogDescription>
              Restore system data from the selected backup. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBackup && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Selected Backup</h4>
                <div className="text-sm text-gray-600">
                  <div><strong>Name:</strong> {selectedBackup.name}</div>
                  <div><strong>Created:</strong> {new Date(selectedBackup.createdAt).toLocaleString()}</div>
                  <div><strong>Size:</strong> {formatFileSize(selectedBackup.size)}</div>
                  <div><strong>Type:</strong> {selectedBackup.type}</div>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="restoreType">Restore Type</Label>
              <Select 
                value={restoreForm.restoreType} 
                onValueChange={(value) => setRestoreForm(prev => ({ ...prev, restoreType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {restoreOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirmRestore"
                checked={restoreForm.confirmRestore}
                onChange={(e) => setRestoreForm(prev => ({ ...prev, confirmRestore: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="confirmRestore" className="text-sm">
                I understand that this action cannot be undone and will overwrite current data
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={restoreBackup}
              disabled={!restoreForm.confirmRestore || isRestoring}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRestoring ? 'Restoring...' : 'Restore Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Best Practices */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Backup Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Recommended Schedule</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Daily:</strong> Incremental backups of changed data</li>
                <li>• <strong>Weekly:</strong> Full system backups</li>
                <li>• <strong>Monthly:</strong> Archive old backups</li>
                <li>• <strong>Before Updates:</strong> Always backup before system changes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Storage Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Local Storage:</strong> Keep recent backups locally</li>
                <li>• <strong>Offsite Storage:</strong> Store backups in different locations</li>
                <li>• <strong>Encryption:</strong> Encrypt sensitive backup data</li>
                <li>• <strong>Testing:</strong> Regularly test backup restoration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Alert */}
      <Alert className="mt-6 border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Important Notice</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Backup and restore operations can take significant time depending on data size. 
          Ensure you have sufficient storage space and avoid performing these operations during peak usage hours.
        </AlertDescription>
      </Alert>
    </div>
  );
}
