// Illustration registry — SVGs from the Flutter app (assets/illustrations). Palette colors only, no <text>:
// numbers/captions get overlaid in code so they localize. `ratio` = viewBox width / height.
// Onboarding art is layered (assets/illustrations/onboarding_*/) and drawn by screens/onboarding/__components/onboarding-art.tsx.
import EmptyBookings from "@/assets/illustrations/empty_bookings.svg";
import FavoritesEmpty from "@/assets/illustrations/favorites_empty.svg";
import NoInternet from "@/assets/illustrations/no_internet.svg";
import NotificationsEmpty from "@/assets/illustrations/notifications_empty.svg";
import QueueJoined from "@/assets/illustrations/queue_joined.svg";
import RatingSent from "@/assets/illustrations/rating_sent.svg";
import SearchNoResults from "@/assets/illustrations/search_no_results.svg";
import YourTurn from "@/assets/illustrations/your_turn.svg";

export const illustrations = {
  empty_bookings: { Svg: EmptyBookings, ratio: 200 / 160 },
  favorites_empty: { Svg: FavoritesEmpty, ratio: 180 / 160 },
  no_internet: { Svg: NoInternet, ratio: 200 / 170 },
  notifications_empty: { Svg: NotificationsEmpty, ratio: 180 / 160 },
  queue_joined: { Svg: QueueJoined, ratio: 160 / 160 },
  rating_sent: { Svg: RatingSent, ratio: 160 / 160 },
  search_no_results: { Svg: SearchNoResults, ratio: 200 / 160 },
  your_turn: { Svg: YourTurn, ratio: 120 / 120 },
} as const;

export type IllustrationName = keyof typeof illustrations;
