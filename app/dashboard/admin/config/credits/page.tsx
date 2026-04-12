import { getAcademicCreditRules } from '@/lib/actions/credit-rule-actions';
import { CreditRulesClient } from './_components/credit-rules-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Academic Credit Rules | SEES Admin',
    description: 'Manage min/max credit thresholds for module registration',
};

export default async function AcademicCreditRulesPage() {
    const rules = await getAcademicCreditRules();

    return (
        <div className="container py-8 px-4">
            <CreditRulesClient initialRules={rules} />
        </div>
    );
}
