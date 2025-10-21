'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Info,
  GraduationCap,
  Users,
  Shield,
  Bell,
  Search,
} from 'lucide-react';
import type { SystemConfiguration } from '@/types';

// Mock data for system configurations
const mockConfigurations: SystemConfiguration[] = [
  {
    id: 'config-001',
    category: 'academic',
    key: 'gpa_calculation_formula',
    value: 'weighted_average',
    description: 'Formula used for calculating student GPA',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T10:00:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-002',
    category: 'academic',
    key: 'credit_limits_min',
    value: '12',
    description: 'Minimum credits required per semester',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T09:30:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-003',
    category: 'academic',
    key: 'credit_limits_max',
    value: '18',
    description: 'Maximum credits allowed per semester',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T09:30:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-004',
    category: 'academic',
    key: 'pathway_threshold',
    value: '60',
    description: 'Percentage threshold for pathway demand allocation',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T08:00:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-005',
    category: 'academic',
    key: 'academic_class_first',
    value: '3.7',
    description: 'GPA threshold for First Class',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T08:00:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-006',
    category: 'user_management',
    key: 'max_login_attempts',
    value: '5',
    description: 'Maximum login attempts before account lockout',
    isActive: true,
    version: 2,
    lastModified: '2025-12-15T07:30:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-007',
    category: 'user_management',
    key: 'session_timeout',
    value: '3600',
    description: 'Session timeout in seconds',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T07:00:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-008',
    category: 'system_settings',
    key: 'maintenance_mode',
    value: 'false',
    description: 'Enable maintenance mode for system updates',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T06:00:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-009',
    category: 'notifications',
    key: 'email_notifications_enabled',
    value: 'true',
    description: 'Enable email notifications for users',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T05:30:00Z',
    modifiedBy: 'ADMIN001'
  },
  {
    id: 'config-010',
    category: 'security',
    key: 'password_min_length',
    value: '8',
    description: 'Minimum password length requirement',
    isActive: true,
    version: 1,
    lastModified: '2025-12-15T05:00:00Z',
    modifiedBy: 'ADMIN001'
  }
];

const configurationCategories = [
  { value: 'academic', label: 'Academic Settings', icon: GraduationCap, description: 'GPA calculations, credit limits, academic rules' },
  { value: 'user_management', label: 'User Management', icon: Users, description: 'Login policies, session management, user roles' },
  { value: 'system_settings', label: 'System Settings', icon: Settings, description: 'System behavior, maintenance, performance' },
  { value: 'security', label: 'Security', icon: Shield, description: 'Password policies, security rules, access control' },
  { value: 'notifications', label: 'Notifications', icon: Bell, description: 'Email settings, notification preferences' }
];


export default function DynamicConfigurationPage() {
  const { user } = useAuthStore();
  const [configurations, setConfigurations] = useState<SystemConfiguration[]>(mockConfigurations);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SystemConfiguration | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [configForm, setConfigForm] = useState({
    category: 'academic',
    key: '',
    value: '',
    description: '',
    isActive: true
  });

  const getCategoryIcon = (category: string) => {
    const cat = configurationCategories.find(c => c.value === category);
    return cat ? cat.icon : Settings;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'user_management': return 'bg-green-100 text-green-800';
      case 'system_settings': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'notifications': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConfigurations = configurations.filter(config => {
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    const matchesSearch = config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateConfig = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newConfig: SystemConfiguration = {
        id: `config-${Date.now()}`,
        category: configForm.category as SystemConfiguration['category'],
        key: configForm.key,
        value: configForm.value,
        description: configForm.description,
        isActive: configForm.isActive,
        version: 1,
        lastModified: new Date().toISOString(),
        modifiedBy: user?.id || 'ADMIN001'
      };
      
      setConfigurations(prev => [newConfig, ...prev]);
      setShowCreateDialog(false);
      setConfigForm({
        category: 'academic',
        key: '',
        value: '',
        description: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error creating configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateConfig = async () => {
    if (!selectedConfig) return;
    
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfigurations(prev => 
        prev.map(config => 
          config.id === selectedConfig.id 
            ? { 
                ...config, 
                category: configForm.category as SystemConfiguration['category'],
                key: configForm.key,
                value: configForm.value,
                description: configForm.description,
                isActive: configForm.isActive,
                version: config.version + 1,
                lastModified: new Date().toISOString(),
                modifiedBy: user?.id || 'ADMIN001'
              }
            : config
        )
      );
      
      setShowEditDialog(false);
      setSelectedConfig(null);
    } catch (error) {
      console.error('Error updating configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = (configId: string) => {
    setConfigurations(prev => prev.filter(config => config.id !== configId));
  };

  const handleToggleActive = async (configId: string) => {
    setConfigurations(prev => 
      prev.map(config => 
        config.id === configId 
          ? { 
              ...config, 
              isActive: !config.isActive,
              lastModified: new Date().toISOString(),
              modifiedBy: user?.id || 'ADMIN001'
            }
          : config
      )
    );
  };

  const openEditDialog = (config: SystemConfiguration) => {
    setSelectedConfig(config);
    setConfigForm({
      category: config.category,
      key: config.key,
      value: config.value,
      description: config.description,
      isActive: config.isActive
    });
    setShowEditDialog(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dynamic Configuration</h1>
            <p className="text-gray-600">
              Manage system settings and configurations without code changes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Configuration Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {configurationCategories.map((category) => {
          const IconComponent = category.icon;
          const count = configurations.filter(c => c.category === category.value).length;
          const activeCount = configurations.filter(c => c.category === category.value && c.isActive).length;
          
          return (
            <Card key={category.value}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-gray-600" />
                  {category.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800">
                  {count}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activeCount} active
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search configurations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {configurationCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configurations
          </CardTitle>
          <CardDescription>
            Manage all system settings and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigurations.map((config) => {
                const CategoryIcon = getCategoryIcon(config.category);
                
                return (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-gray-600" />
                        <Badge className={getCategoryColor(config.category)}>
                          {config.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{config.key}</div>
                      <div className="text-xs text-gray-500">v{config.version}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate font-mono text-sm">
                        {config.value}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600">{config.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.isActive}
                          onCheckedChange={() => handleToggleActive(config.id)}
                        />
                        <Badge variant={config.isActive ? 'default' : 'secondary'}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{new Date(config.lastModified).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{config.modifiedBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(config)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteConfig(config.id)}
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

      {/* Create Configuration Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Configuration</DialogTitle>
            <DialogDescription>
              Add a new system configuration setting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={configForm.category} 
                onValueChange={(value) => setConfigForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {configurationCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-xs text-gray-600">{category.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="key">Configuration Key</Label>
              <Input
                id="key"
                placeholder="e.g., gpa_calculation_formula"
                value={configForm.key}
                onChange={(e) => setConfigForm(prev => ({ ...prev, key: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                placeholder="Enter configuration value"
                value={configForm.value}
                onChange={(e) => setConfigForm(prev => ({ ...prev, value: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this configuration does"
                value={configForm.description}
                onChange={(e) => setConfigForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={configForm.isActive}
                onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateConfig}
              disabled={!configForm.key || !configForm.value || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? 'Creating...' : 'Create Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Configuration Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Configuration</DialogTitle>
            <DialogDescription>
              Modify the selected configuration setting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCategory">Category</Label>
              <Select 
                value={configForm.category} 
                onValueChange={(value) => setConfigForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {configurationCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="editKey">Configuration Key</Label>
              <Input
                id="editKey"
                value={configForm.key}
                onChange={(e) => setConfigForm(prev => ({ ...prev, key: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="editValue">Value</Label>
              <Input
                id="editValue"
                value={configForm.value}
                onChange={(e) => setConfigForm(prev => ({ ...prev, value: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={configForm.description}
                onChange={(e) => setConfigForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={configForm.isActive}
                onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateConfig}
              disabled={!configForm.key || !configForm.value || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configuration Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Configuration Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Best Practices</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use descriptive keys that clearly indicate the setting's purpose</li>
                <li>• Provide detailed descriptions for future reference</li>
                <li>• Test configuration changes in a development environment first</li>
                <li>• Document any dependencies between configurations</li>
                <li>• Use version control for configuration changes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Value Types</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>String:</strong> Text values, formulas, file paths</li>
                <li>• <strong>Number:</strong> Numeric values, thresholds, limits</li>
                <li>• <strong>Boolean:</strong> True/false settings, feature flags</li>
                <li>• <strong>JSON:</strong> Complex objects, arrays, nested settings</li>
                <li>• <strong>Array:</strong> Lists of values, multiple options</li>
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
          Configuration changes take effect immediately and may impact system behavior. 
          Always test changes in a development environment before applying to production.
        </AlertDescription>
      </Alert>
    </div>
  );
}
