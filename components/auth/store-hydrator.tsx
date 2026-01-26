'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

export function StoreHydrator({ user }: { user: User }) {
    const { setUser } = useAuthStore();
    const initialized = useRef(false);

    useEffect(() => {
        if (user) {
            console.log('StoreHydrator executing:', user);
            // Only update if actually different to avoid potential loops/redundant updates
            // But for now, ensure we overwrite the persisted state with server truth
            setUser(user);
        }
    }, [user, setUser]);

    return null;
}
