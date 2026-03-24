import { cn } from '@/lib/utils';

import type { RecentActivity } from '@/lib/data/dashboard';

type Props = {
  activities: RecentActivity[];
};

export function ActivityFeed({ activities }: Props) {
  return (
    <div
      className={cn('rounded-xl bg-white px-6 py-5', {
        'pr-2.5': activities.length > 3,
      })}
    >
      <p className="text-on-muted mb-4 text-[10px] font-bold tracking-[0.2em] uppercase">
        Hoạt động
      </p>

      {activities.length === 0 ? (
        <p className="text-on-muted py-2 text-center text-sm">
          Chưa có hoạt động nào gần đây.
        </p>
      ) : (
        <ul
          className={cn('max-h-23 space-y-4 overflow-y-auto', {
            'pr-2.5': activities.length > 3,
          })}
        >
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    activity.color === 'orange'
                      ? 'bg-orange-400'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="text-on-surface truncate text-sm">
                  {activity.description}
                </span>
              </div>
              <span className="text-on-muted shrink-0 text-xs whitespace-nowrap">
                {activity.timeAgo}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
