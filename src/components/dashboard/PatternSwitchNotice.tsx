// src/components/dashboard/PatternSwitchNotice.tsx
// 打卡導致格局切換時的因果鏈提示。
// 顯示：哪一天打卡、什麼回饋、哪個分數變動、從哪個格局切到哪一個。
import { useMemo, useState } from "react";
import type { AppNotification } from "../../storage";
import { getAllNotifications, markNotificationRead } from "../../storage";

interface PatternSwitchNoticeProps {
  onDismiss?: () => void;
}

export default function PatternSwitchNotice({ onDismiss }: PatternSwitchNoticeProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    setLoading(false);
  }, []);

  // fetch on mount via lazy effect
  (async () => {
    try {
      const all = await getAllNotifications();
      setNotifications(all.filter((n) => n.type === "pattern_switch"));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  })();

  const unread = notifications.filter((n) => !n.read);

  if (loading) return null;
  if (notifications.length === 0) return null;

  const latest = notifications[notifications.length - 1];

  return (
    <div
      className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 mb-4 animate-fade-in-up"
      role="region"
      aria-label="格局自動調整通知"
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-400 font-bold">
          !
        </span>
        <div>
          <h4 className="text-xs font-bold text-amber-300 mb-0.5 flex items-center gap-1">
            <span>📈</span> 格局自動調整
          </h4>
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            {latest.message}
          </p>
        </div>
      </div>

      {/* 因果鏈說明 */}
      <div className="mt-2 p-2 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-300 leading-relaxed space-y-1">
        <p className="font-bold text-amber-200 mb-1">因果鏈：</p>
        <div className="flex items-start gap-1.5 text-[10px]">
          <span className="text-zinc-500">打卡日：</span>
          <span className="text-zinc-300">{latest.date}</span>
        </div>
        <div className="flex items-start gap-1.5 text-[10px]">
          <span className="text-zinc-500">從格局：</span>
          <span className="text-amber-300 font-bold">{latest.oldPattern}</span>
        </div>
        <div className="flex items-start gap-1.5 text-[10px]">
          <span className="text-zinc-500">切至格局：</span>
          <span className="text-emerald-400 font-bold">{latest.newPattern}</span>
        </div>
        <p className="text-[10px] text-zinc-500 mt-1">
          系統依你近期打卡的實際感受（順利／不順），累積格局分數後自動切換。這是「越用越準」的回饋：你的生活體驗越準，命盤越貼近你。
        </p>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => {
            void markNotificationRead(latest.createdAt);
            onDismiss?.();
          }}
          className="text-[10px] text-amber-400 hover:text-amber-300 underline underline-offset-4"
        >
          已了解
        </button>
      </div>
    </div>
  );
}
