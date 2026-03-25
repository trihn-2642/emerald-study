import { Layers } from 'lucide-react';

type Props = {
  deckName: string;
};

function DeckSelector({ deckName }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
      <Layers className="h-4 w-4 shrink-0 text-emerald-600" />
      <span className="text-sm font-medium text-emerald-700">{deckName}</span>
    </div>
  );
}

export { DeckSelector };
