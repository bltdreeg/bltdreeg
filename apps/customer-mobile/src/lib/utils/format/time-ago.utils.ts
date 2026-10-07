// "من ٣ أيام" للتقييمات والإشعارات — منقول من time_ago.dart في Flutter. النص من mobile.common.timeAgo.<unit>
export type TimeAgoUnit = "minutes" | "hours" | "days" | "weeks" | "months";

export function timeAgo(iso: string, now: number): { unit: TimeAgoUnit; count: number } {
  const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60_000));
  if (minutes < 60) return { unit: "minutes", count: minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { unit: "hours", count: hours };
  const days = Math.floor(hours / 24);
  if (days < 7) return { unit: "days", count: days };
  if (days < 30) return { unit: "weeks", count: Math.floor(days / 7) };
  return { unit: "months", count: Math.floor(days / 30) };
}
