export const dynamic = "force-dynamic";
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
} from '@/components/ui/dialog';
import {
  Settings,
  Plus,
  Edit,
  AlertTriangle,
  Info,
  GraduationCap,
  Users,
  Shield,
  Bell,
  Search,
  Activity,
  History,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { getCategorizedSettings, updateSystemSettingWithAudit, initializeSystemGovernance, getAuditLogs } from '@/lib/actions/system-settings-actions';
import { toast } from 'sonner';

const configurationCategories = [
  { value: 'ACADEMIC', label: 'Academic Policies', icon: GraduationCap },
  { value: 'OPERATIONS', label: 'Gov. Windows', icon: Activity },
  { value: 'SYSTEM', label: 'Infrastructural', icon: Settings },
  { value: 'SECURITY', label: 'Authentication', icon: Shield },
  { value: 'BRANDING', label: 'Identity', icon: Users },
  { value: 'HISTORY', label: 'Audit Logs', icon: History },
  { value: 'GENERAL', label: 'Miscellaneous', icon: Info }
];

export default function DynamicConfigurationPage() {
  const [settings, setSettings] = useState<Record<string, any[]>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('OPERATIONS');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingConfig, setEditingConfig] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getCategorizedSettings();
      setSettings(data);
    } catch (err) {
      toast.error("Failed to load real-time settings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      toast.error("Failed to load audit trail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === 'HISTORY') {
      fetchLogs();
    } else {
      fetchSettings();
    }
  }, [selectedCategory]);

  const handleUpdate = async (key: string, value: string) => {
    setSaving(true);
    try {
      const res = await updateSystemSettingWithAudit(key, value);
      if (res.success) {
        toast.success(`Updated ${key} successfully.`);
        fetchSettings();
        setEditingConfig(null);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentSettings = settings[selectedCategory] || [];
  const filteredSettings = currentSettings.filter(s => 
    s.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Syncing with Governance Engine...</p>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Enterprise Governance</h1>
          <p className="text-muted-foreground">Manage real-time windows, policies, and system sovereignty.</p>
        </div>
        <Button variant="outline" onClick={() => initializeSystemGovernance().then(() => fetchSettings())}>
          Bootstrap Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {configurationCategories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.value 
                    ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]" 
                    : "hover:bg-muted"
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                  <Badge variant="secondary" className="ml-auto opacity-50">
                    {settings[cat.value]?.length || 0}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Alert className="bg-blue-50/50 border-blue-200">
            <History className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 text-xs font-bold uppercase">Audit Enabled</AlertTitle>
            <AlertDescription className="text-blue-600 text-[10px]">
              Every change is logged with your Admin ID for accountability.
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search keys, descriptions, or logs..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            {selectedCategory === 'HISTORY' ? (
               logs.filter(l => l.action.includes(searchTerm.toUpperCase()) || l.entity_id.includes(searchTerm)).map(log => (
                <div key={log.log_id} className="border rounded-lg p-4 bg-muted/30 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                         <History className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-tight text-muted-foreground">{log.action}</div>
                        <div className="text-sm font-medium">Changed <span className="font-mono">{log.new_value}</span></div>
                        <div className="text-[10px] text-muted-foreground">AD: {log.admin_id} | {new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <Badge variant="outline" className="text-[9px]">ID: {log.entity_id.slice(0,8)}</Badge>
                   </div>
                </div>
               ))
            ) : (
              filteredSettings.map(s => (
                <Card key={s.setting_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">{s.key}</code>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">{s.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{s.description || "No description provided."}</p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-4">
                          {s.value === 'true' || s.value === 'false' ? (
                            <div className="flex items-center gap-2">
                               <Switch 
                                 checked={s.value === 'true'} 
                                 onCheckedChange={(val) => handleUpdate(s.key, val.toString())}
                               />
                               <span className={`text-[10px] font-bold ${s.value === 'true' ? "text-green-600" : "text-gray-400"}`}>
                                  {s.value === 'true' ? "OPEN/ACTIVE" : "LOCKED/INACTIVE"}
                               </span>
                            </div>
                          ) : (
                            <div className="text-right">
                               <div className="text-xs font-mono font-bold bg-muted px-3 py-1 rounded truncate max-w-[150px]">
                                 {s.value}
                               </div>
                               <p className="text-[9px] text-muted-foreground mt-1">Last Updated: {new Date(s.updated_at).toLocaleDateString()}</p>
                            </div>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setEditingConfig(s)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {selectedCategory === 'HISTORY' && logs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl italic">
                The audit trail is currently empty. Start making changes to see records here.
              </div>
            )}

            {selectedCategory !== 'HISTORY' && filteredSettings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl italic">
                No configurations found in {selectedCategory}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Configuration</DialogTitle>
            <DialogDescription>
              Modifying <span className="font-bold text-blue-600">{editingConfig?.key}</span>. 
              Changes impact system behavior immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Value</Label>
              <Input 
                 defaultValue={editingConfig?.value} 
                 id="edit-config-val"
                 className="font-mono bg-muted"
              />
              <p className="text-[10px] text-muted-foreground italic">
                {editingConfig?.key.includes('threshold') ? "Expected: Float (e.g. 3.7)" : "Expected: String or Number"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingConfig(null)}>Cancel</Button>
            <Button 
              disabled={saving}
              onClick={() => {
                const val = (document.getElementById('edit-config-val') as HTMLInputElement).value;
                handleUpdate(editingConfig.key, val);
              }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Save & Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
