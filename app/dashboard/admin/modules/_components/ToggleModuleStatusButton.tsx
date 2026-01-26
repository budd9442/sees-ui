'use client';

import { Button } from "@/components/ui/button";
import { toggleModuleStatus } from "@/lib/actions/admin-modules";
import { Archive, RefreshCcw, Loader2 } from "lucide-react";
import { useState } from "react";

export function ToggleModuleStatusButton({ id, active }: { id: string, active: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            await toggleModuleStatus(id);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleToggle} disabled={loading} title={active ? "Deactivate" : "Activate"}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                active ? <Archive className="h-4 w-4 text-muted-foreground" /> : <RefreshCcw className="h-4 w-4 text-green-600" />
            )}
        </Button>
    )
}
