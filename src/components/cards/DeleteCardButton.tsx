'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { deleteCard } from '@/lib/data/cards';

type Props = {
  cardId: string;
  deckId: string;
};

function DeleteCardButton({ cardId, deckId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        'Bạn có chắc muốn xóa thẻ này không? Hành động này không thể hoàn tác.',
      )
    )
      return;

    startTransition(async () => {
      const result = await deleteCard(cardId, deckId);
      if (result.error) {
        toast.error(`❌ ${result.error}`);
        return;
      }
      toast.success('🗑️ Đã xóa thẻ.');
      router.push(`/library/${deckId}`);
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-on-surface text-sm font-medium">Xóa thẻ</p>
        <p className="text-on-muted mt-0.5 text-xs">
          Hành động này không thể hoàn tác.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleDelete}
        disabled={isPending}
        className="border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
        {isPending ? 'Đang xóa...' : 'Xóa thẻ'}
      </Button>
    </div>
  );
}

export { DeleteCardButton };
