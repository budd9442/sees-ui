export const dynamic = "force-dynamic";
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calculator, Settings, Save, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getRankingWeights, updateRankingWeights } from '@/lib/actions/hod-actions';
import { useRouter } from 'next/navigation';

export default function WeightedAverageConfigurationPage() {
  const router = useRouter();
  const [gpaWeight, setGpaWeight] = useState<string>('0.6');
  const [passRateWeight, setPassRateWeight] = useState<string>('0.4');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadWeights = async () => {
      try {
        const weights = await getRankingWeights();
        setGpaWeight(weights.gpaWeight.toString());
        setPassRateWeight(weights.passRateWeight.toString());
      } catch (error) {
        console.error("Failed to load weights", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };
    loadWeights();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const gw = parseFloat(gpaWeight);
      const prw = parseFloat(passRateWeight);
      if (isNaN(gw) || isNaN(prw)) {
        toast.error('Weights must be valid numbers');
        setIsSaving(false);
        return;
      }
      if (gw + prw !== 1.0) {
        toast.warning('Weights usually add up to 1.0. Proceeding anyway.');
      }
      await updateRankingWeights(gw, prw);
      toast.success('Ranking weights updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to update weights', error);
      toast.error('Failed to update weights');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading configurations...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Student Ranking Configurations</h1>
        <p className="text-gray-600">
          Configure the weights used to calculate the 'overall' ranking metric for students in your department.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            System Weights
          </CardTitle>
          <CardDescription>
            Set the proportional weights of metrics for the Overall ranking computation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gpaWeight">Cumulative GPA Weight (e.g., 0.6)</Label>
              <Input
                id="gpaWeight"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={gpaWeight}
                onChange={(e) => setGpaWeight(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">The impact of the raw GPA score.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passRateWeight">Pass Rate Weight (e.g., 0.4)</Label>
              <Input
                id="passRateWeight"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={passRateWeight}
                onChange={(e) => setPassRateWeight(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">The impact of the credits completion ratio.</p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Formula Preview</h4>
            <div className="font-mono text-sm bg-background p-3 rounded border">
              Overall Score = (GPA × {gpaWeight || '0'}) + (PassRate(4.0 Scale) × {passRateWeight || '0'})
            </div>
          </div>

        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardFooter>
      </Card>

      <Alert className="mt-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Guidelines</AlertTitle>
        <AlertDescription className="text-blue-700 mt-2 text-sm space-y-2">
          <p>• The weights typically add up to exactly 1.0.</p>
          <p>• This configuration is used instantaneously across the platform whenever a user selects the "Overall" property in the Student Rankings page or exports the records.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
