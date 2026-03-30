import { cn } from '@/lib/utils';

const STATE_MAP = {
  0: { label: 'Mới', className: 'bg-blue-500/10 text-blue-600' },
  1: { label: 'Đang học', className: 'bg-orange-500/10 text-orange-600' },
  2: { label: 'Đã thuộc', className: 'bg-emerald-500/10 text-emerald-600' },
  3: { label: 'Học lại', className: 'bg-red-500/10 text-red-600' },
} as const;

type State = keyof typeof STATE_MAP;

type Props = {
  state: number;
};

function MasteryBadge({ state }: Props) {
  const config = STATE_MAP[(state as State) ?? 0] ?? STATE_MAP[0];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-tighter uppercase',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

export { MasteryBadge };
