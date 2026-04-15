import { PathwaySelectionClient } from './_components/pathway-selection-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pathway Selection | SEES Platform',
    description: 'Select your specialized degree pathway for Level 2 and beyond.',
};

export default function PathwaySelectionPage() {
    return (
        <div className="container max-w-7xl py-8 px-4 md:px-8">
            <PathwaySelectionClient />
        </div>
    );
}
