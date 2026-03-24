import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <Spinner className="size-10" />
    </div>
  );
}
