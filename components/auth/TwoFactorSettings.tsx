'use client';

import { useState, useEffect } from 'react';
import { 
    initiateTwoFactorSetup, 
    confirmTwoFactorSetup, 
    disableTwoFactor,
    getTwoFactorStatus 
} from '@/lib/actions/two-factor-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, ShieldAlert, Loader2, QrCode, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export function TwoFactorSettings() {
    const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<{ secret: string, qrCodeUrl: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);

    useEffect(() => {
        getTwoFactorStatus().then(setIsEnabled);
    }, []);

    const handleInitiate = async () => {
        setIsPending(true);
        try {
            const data = await initiateTwoFactorSetup();
            setQrCodeData(data);
        } catch (error) {
            toast.error('Failed to initiate 2FA setup');
        } finally {
            setIsPending(false);
        }
    };

    const handleVerify = async () => {
        if (!qrCodeData) return;
        setIsPending(true);
        try {
            const result = await confirmTwoFactorSetup(verificationCode, qrCodeData.secret);
            if (result.success) {
                setIsEnabled(true);
                setBackupCodes(result.backupCodes || []);
                setShowBackupCodes(true);
                toast.success('Two-factor authentication enabled successfully');
            } else {
                toast.error(result.error || 'Verification failed');
            }
        } catch (error) {
            toast.error('An error occurred during verification');
        } finally {
            setIsPending(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm('Are you sure you want to disable two-factor authentication? This will reduce your account security.')) return;
        
        setIsPending(true);
        try {
            const result = await disableTwoFactor();
            if (result.success) {
                setIsEnabled(false);
                toast.success('Two-factor authentication disabled');
            }
        } catch (error) {
            toast.error('Failed to disable 2FA');
        } finally {
            setIsPending(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (isEnabled === null) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <Card className="overflow-hidden border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isEnabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    </div>
                    <div>
                        <CardTitle className="text-lg">Two-Factor Authentication (2FA)</CardTitle>
                        <CardDescription>
                            {isEnabled 
                                ? 'Your account is secured with TOTP authentication.' 
                                : 'Add an extra layer of security to your account.'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {isEnabled ? (
                    <div className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">2FA is Active</AlertTitle>
                            <AlertDescription className="text-green-700">
                                You will be prompted for a security code from your authenticator app whenever you sign in.
                            </AlertDescription>
                        </Alert>
                        <div className="flex justify-between items-center">
                            <Button variant="outline" onClick={() => setShowBackupCodes(true)}>
                                View Backup Codes
                            </Button>
                            <Button variant="destructive" onClick={handleDisable} disabled={isPending}>
                                {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                                Disable 2FA
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.
                        </p>
                        <Dialog onOpenChange={(open) => !open && setQrCodeData(null)}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto" onClick={handleInitiate}>
                                    Enable 2FA
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Setup Authenticator App</DialogTitle>
                                    <DialogDescription>
                                        Use an app like Google Authenticator or Authy to scan the QR code.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                {qrCodeData ? (
                                    <div className="space-y-6 py-4 flex flex-col items-center">
                                        <div className="bg-white p-4 rounded-xl shadow-inner border">
                                            <Image 
                                                src={qrCodeData.qrCodeUrl} 
                                                alt="2FA QR Code" 
                                                width={200} 
                                                height={200} 
                                                className="block"
                                            />
                                        </div>
                                        
                                        <div className="w-full space-y-4">
                                            <div className="space-y-2">
                                                <Label>Can't scan the code?</Label>
                                                <div className="flex gap-2">
                                                    <code className="flex-1 bg-muted p-2 rounded text-xs break-all font-mono border">
                                                        {qrCodeData.secret}
                                                    </code>
                                                    <Button size="icon" variant="outline" onClick={() => copyToClipboard(qrCodeData.secret)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="verify">Verification Code</Label>
                                                <Input 
                                                    id="verify" 
                                                    placeholder="Enter 6-digit code" 
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    maxLength={6}
                                                    className="text-center text-lg tracking-widest font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                    </div>
                                )}
                                
                                <DialogFooter>
                                    <Button className="w-full" onClick={handleVerify} disabled={isPending || !verificationCode}>
                                        {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                        Verify and Enable
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </CardContent>

            {/* Backup Codes Dialog */}
            <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Backup Recovery Codes</DialogTitle>
                        <DialogDescription>
                            Store these codes securely. You can use them to log in if you lose access to your authenticator app.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2 py-4">
                        {backupCodes.map((code, index) => (
                            <div key={index} className="bg-muted p-2 rounded font-mono text-sm text-center border">
                                {code}
                            </div>
                        ))}
                    </div>
                    <Alert className="bg-amber-50 border-amber-200">
                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-700">
                            Each code can only be used once. If you run out, regenerate them in your settings.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => copyToClipboard(backupCodes.join('\n'))}>
                            Copy All
                        </Button>
                        <Button onClick={() => setShowBackupCodes(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

const Separator = () => <div className="h-px bg-border w-full my-4" />;
