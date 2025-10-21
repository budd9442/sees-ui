import RosterPageClient from './RosterPageClient';

interface RosterPageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

export default async function RosterPage({ params }: RosterPageProps) {
  const { moduleId } = await params;
  
  return <RosterPageClient moduleId={moduleId} />;
}