'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteCard } from '@/lib/data/cards';
import { generatePath, ROUTES } from '@/lib/routes';

type Props = {
  cardId: string;
  deckId: string;
};

function DeleteCardButton({ cardId, deckId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteCard(cardId, deckId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success('🗑️ Đã xóa thẻ.');
      router.push(generatePath(ROUTES.DECK_CARDS, { deckId }));
    });
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-on-surface text-sm font-medium">Xóa thẻ</p>
        <p className="text-on-muted mt-0.5 text-xs">
          Hành động này không thể hoàn tác.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Xóa thẻ
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa thẻ</DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <p className="text-on-muted text-sm">
              Bạn có chắc muốn xóa thẻ này không? Hành động này{' '}
              <span className="text-on-surface font-semibold">
                không thể hoàn tác
              </span>
              .
            </p>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? 'Đang xóa...' : 'Xóa thẻ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { DeleteCardButton };
