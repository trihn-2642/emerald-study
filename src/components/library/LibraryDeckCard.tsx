'use client';

import { BookOpen, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import Loading from '@/app/loading';
import { EditDeckDialog } from '@/components/library/EditDeckDialog';
import { MasteryRing } from '@/components/library/MasteryRing';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LANGUAGE_LABELS } from '@/constants';
import { deleteDeck } from '@/lib/data/library';
import { cn } from '@/lib/utils';

import type { Deck } from '@/types';

type Props = {
  deck: Deck;
  isOptimistic?: boolean;
};

function LibraryDeckCard({ deck, isOptimistic }: Props) {
  const {
    id,
    name,
    card_count,
    due_count,
    mastery_percent,
    language,
    description,
  } = deck;
  const mastery = mastery_percent ?? 0;
  const langConfig = LANGUAGE_LABELS[language as keyof typeof LANGUAGE_LABELS];

  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteDeck(id);
      if ('error' in result) {
        toast.error(`❌ ${result.error}`);
        return;
      }
      toast.success('🗑️ Đã xóa bộ thẻ.');
      router.refresh();
    });
  }

  return (
    <>
      {isPending && <Loading />}
      <div
        className={cn(
          'group relative rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
          dropdownOpen && '-translate-y-0.5 shadow-md',
          isOptimistic && 'pointer-events-none animate-pulse opacity-70',
        )}
      >
        {/* 3-dot menu */}
        {!isOptimistic && (
          <div className="absolute top-3 right-3 z-10">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Tuỳ chọn"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  disabled={isPending}
                  className="text-red-500 focus:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isPending ? 'Đang xóa...' : 'Xóa bộ thẻ'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Clickable card area */}
        <Link
          href={isOptimistic ? '#' : `/library/${id}/cards`}
          onClick={isOptimistic ? (e) => e.preventDefault() : undefined}
          className="block p-5"
        >
          {/* Top row */}
          <div className="mb-3 flex items-start justify-between pr-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>

            {/* Circular mastery ring */}
            <MasteryRing mastery={mastery} />
          </div>
          {/* Deck name */}
          <h3 className="text-on-surface mb-1 truncate text-sm font-semibold whitespace-pre">
            {name}
          </h3>
          {/* Description */}
          <p
            className={cn(
              'mb-3 line-clamp-2 text-xs whitespace-break-spaces text-slate-400',
              !description && 'text-slate-300 italic',
            )}
          >
            {description || 'Không có mô tả.'}
          </p>
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {due_count > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                Cần ôn: {due_count} thẻ
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Sạch bóng!
              </span>
            )}

            {langConfig && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  langConfig.className,
                )}
              >
                {langConfig.label}
              </span>
            )}
          </div>
          {/* Card count */}
          <p className="text-on-muted mt-2 text-xs">{card_count} thẻ</p>
        </Link>
      </div>

      <EditDeckDialog deck={deck} open={editOpen} onOpenChange={setEditOpen} />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa bộ thẻ</DialogTitle>
          </DialogHeader>
          <p className="text-on-muted text-sm">
            Bạn có chắc muốn xóa bộ thẻ{' '}
            <span className="text-on-surface font-semibold">
              &ldquo;{name}&rdquo;
            </span>
            ? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                setDeleteOpen(false);
                handleDelete();
              }}
            >
              {isPending ? 'Đang xóa...' : 'Xóa bộ thẻ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { LibraryDeckCard };
