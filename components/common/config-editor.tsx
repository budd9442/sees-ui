'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Code,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

interface ConfigEditorProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  onSave?: (value: Record<string, any>) => Promise<void> | void;
  title?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  validate?: (value: Record<string, any>) => { valid: boolean; error?: string };
}

export function ConfigEditor({
  value,
  onChange,
  onSave,
  title = 'Configuration Editor',
  description = 'Edit configuration settings',
  className = '',
  disabled = false,
  showPreview = true,
  validate,
}: ConfigEditorProps) {
  const [jsonString, setJsonString] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showRawEditor, setShowRawEditor] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize JSON string from value
  useEffect(() => {
    try {
      const newJsonString = JSON.stringify(value, null, 2);
      setJsonString(newJsonString);
      setIsValid(true);
      setError(null);
    } catch (err) {
      setError('Invalid configuration format');
      setIsValid(false);
    }
  }, [value]);

  const handleJsonChange = (newJsonString: string) => {
    setJsonString(newJsonString);
    setHasChanges(true);

    try {
      const parsed = JSON.parse(newJsonString);
      
      // Validate if validator provided
      if (validate) {
        const validation = validate(parsed);
        if (!validation.valid) {
          setError(validation.error || 'Validation failed');
          setIsValid(false);
          return;
        }
      }

      setIsValid(true);
      setError(null);
      onChange(parsed);
    } catch (err) {
      setError('Invalid JSON format');
      setIsValid(false);
    }
  };

  const handleSave = async () => {
    if (!isValid || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(value);
      setHasChanges(false);
      toast.success('Configuration saved successfully!');
    } catch (err) {
      toast.error('Failed to save configuration');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    try {
      const resetJsonString = JSON.stringify(value, null, 2);
      setJsonString(resetJsonString);
      setIsValid(true);
      setError(null);
      setHasChanges(false);
    } catch (err) {
      setError('Failed to reset configuration');
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonString(formatted);
      toast.success('JSON formatted successfully');
    } catch (err) {
      toast.error('Invalid JSON format');
    }
  };

  const renderPreview = () => {
    if (!showPreview) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Configuration Preview</h4>
          <Badge variant={isValid ? 'default' : 'destructive'}>
            {isValid ? 'Valid' : 'Invalid'}
          </Badge>
        </div>
        
        <div className="p-4 border rounded-lg bg-muted/50 max-h-64 overflow-auto">
          <pre className="text-xs">
            {isValid ? JSON.stringify(value, null, 2) : 'Invalid configuration'}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawEditor(!showRawEditor)}
            >
              {showRawEditor ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showRawEditor ? 'Hide' : 'Show'} Raw
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* JSON Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="config-json">Configuration JSON</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={formatJson}
                disabled={disabled}
              >
                Format JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={disabled || !hasChanges}
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
          
          <Textarea
            id="config-json"
            value={jsonString}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder="Enter configuration JSON..."
            className={`min-h-64 font-mono text-sm ${
              isValid ? '' : 'border-red-500 focus:border-red-500'
            }`}
            disabled={disabled}
          />
        </div>

        {/* Preview */}
        {renderPreview()}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm text-muted-foreground">
              {isValid ? 'Configuration is valid' : 'Configuration has errors'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={disabled || !hasChanges}
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            {onSave && (
              <Button
                onClick={handleSave}
                disabled={disabled || !isValid || isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
