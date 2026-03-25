import { cn } from '@/lib/utils';

const STATE_MAP = {
  0: { label: 'Mới', className: 'bg-slate-100 text-slate-600' },
  1: { label: 'Đang học', className: 'bg-amber-100 text-amber-700' },
  2: { label: 'Ôn tập', className: 'bg-blue-100 text-blue-700' },
  3: { label: 'Học lại', className: 'bg-red-100 text-red-700' },
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
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

export { MasteryBadge };
