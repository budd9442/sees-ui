import { checkFeatureFlag } from '@/app/actions/feature-flags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface FeatureGuardProps {
    featureKey: string;
    userRole?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default async function FeatureGuard({ featureKey, userRole, children, fallback }: FeatureGuardProps) {
    const isEnabled = await checkFeatureFlag(featureKey, userRole);

    if (isEnabled) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="flex h-[50vh] w-full items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <AlertCircle className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                    <CardTitle>Feature Unavailable</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This feature is currently unavailable or you do not have permission to access it.
                        Please check the academic calendar or contact your administrator.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
