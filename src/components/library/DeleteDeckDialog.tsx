'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteDeck } from '@/lib/data/library';
import { ROUTES } from '@/lib/routes';

type Props = {
  deckId: string;
  deckName: string;
};

function DeleteDeckDialog({ deckId, deckName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteDeck(deckId);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.push(ROUTES.LIBRARY);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Xóa bộ thẻ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Xóa bộ thẻ</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <p className="text-on-muted text-sm">
            Bạn có chắc muốn xóa bộ thẻ{' '}
            <span className="text-on-surface font-semibold">
              &ldquo;{deckName}&rdquo;
            </span>
            ? Tất cả thẻ trong bộ này sẽ bị xóa vĩnh viễn và không thể khôi
            phục.
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
              {isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteDeckDialog };
