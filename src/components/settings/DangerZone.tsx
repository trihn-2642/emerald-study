'use client';

import { TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { deleteAccount } from '@/lib/data/settings';
import { ROUTES } from '@/lib/routes';

export function DangerZone() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [isPending, startTransition] = useTransition();

  const CONFIRM_TEXT = 'xóa tài khoản';

  const handleDelete = () => {
    if (confirm.trim().toLowerCase() !== CONFIRM_TEXT) return;
    startTransition(async () => {
      const result = await deleteAccount();
      if (result.error) {
        toast.error(`❌ ${result.error}`);
      } else {
        toast.success('Tài khoản đã được đăng xuất.');
        router.replace(ROUTES.LOGIN);
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Xóa tài khoản</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <p className="text-sm text-slate-600">
              Hành động này{' '}
              <span className="font-bold text-red-600">không thể hoàn tác</span>
              . Toàn bộ dữ liệu học tập, bộ thẻ và lịch sử sẽ bị xóa vĩnh viễn.
            </p>
            <div>
              <p className="mb-1.5 text-xs text-slate-500">
                Nhập{' '}
                <span className="font-mono font-bold text-slate-700">
                  {CONFIRM_TEXT}
                </span>{' '}
                để xác nhận:
              </p>
              <Input
                placeholder={CONFIRM_TEXT}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                disabled={
                  confirm.trim().toLowerCase() !== CONFIRM_TEXT || isPending
                }
                onClick={handleDelete}
              >
                {isPending ? 'Đang xóa…' : 'Xóa tài khoản'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50/60 px-6 py-5">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-bold text-red-700">Vùng nguy hiểm</p>
            <p className="mt-0.5 text-sm text-red-500">
              Thao tác này sẽ xóa vĩnh viễn dữ liệu học tập của bạn và không thể
              hoàn tác.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="shrink-0 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
        >
          Xóa tài khoản
        </Button>
      </div>
    </>
  );
}
