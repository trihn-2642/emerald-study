import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CardForm } from '@/components/cards/CardForm';
import { getDeckById } from '@/lib/data/library';
import { getUser } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ deckId: string }>;
};

export default async function NewCardPage({ params }: Props) {
  const { deckId } = await params;
  const user = await getUser();
  if (!user) notFound();

  const deck = await getDeckById(deckId, user.id);
  if (!deck) notFound();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link
          href={`/library/${deckId}/cards`}
          className="text-on-muted hover:text-on-surface mb-4 flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {deck.name}
        </Link>
        <h1 className="text-on-surface text-2xl font-bold">Thêm thẻ mới</h1>
        <p className="text-on-muted mt-1 text-sm">
          Thêm thẻ vào bộ{' '}
          <span className="text-on-surface font-medium">{deck.name}</span>
        </p>
      </div>

      <CardForm deckId={deckId} deckName={deck.name} />
    </div>
  );
}
