// Icon registry — SVGs from the Flutter app (assets/icons). 24×24 viewBox, stroke 1.75, round caps/joins,
// tinted via currentColor. `*_bold` variants (stroke 2.15) are the selected bottom-nav state. `google` is the only multicolor icon.
import AlertCircle from "@/assets/icons/alert_circle.svg";
import Apple from "@/assets/icons/apple.svg";
import Bell from "@/assets/icons/bell.svg";
import Calendar from "@/assets/icons/calendar.svg";
import CalendarBold from "@/assets/icons/calendar_bold.svg";
import CalendarCheck from "@/assets/icons/calendar_check.svg";
import Camera from "@/assets/icons/camera.svg";
import Chair from "@/assets/icons/chair.svg";
import Check from "@/assets/icons/check.svg";
import CheckBold from "@/assets/icons/check_bold.svg";
import ChevronDown from "@/assets/icons/chevron_down.svg";
import ChevronLeft from "@/assets/icons/chevron_left.svg";
import ChevronRight from "@/assets/icons/chevron_right.svg";
import Clock from "@/assets/icons/clock.svg";
import Close from "@/assets/icons/close.svg";
import Eye from "@/assets/icons/eye.svg";
import EyeOff from "@/assets/icons/eye_off.svg";
import Filter from "@/assets/icons/filter.svg";
import Gift from "@/assets/icons/gift.svg";
import Globe from "@/assets/icons/globe.svg";
import Google from "@/assets/icons/google.svg";
import Heart from "@/assets/icons/heart.svg";
import HeartFilled from "@/assets/icons/heart_filled.svg";
import HelpCircle from "@/assets/icons/help_circle.svg";
import Home from "@/assets/icons/home.svg";
import HomeBold from "@/assets/icons/home_bold.svg";
import Lock from "@/assets/icons/lock.svg";
import Logout from "@/assets/icons/logout.svg";
import MapPin from "@/assets/icons/map_pin.svg";
import Message from "@/assets/icons/message.svg";
import Money from "@/assets/icons/money.svg";
import Moon from "@/assets/icons/moon.svg";
import Navigation from "@/assets/icons/navigation.svg";
import Phone from "@/assets/icons/phone.svg";
import Play from "@/assets/icons/play.svg";
import Plus from "@/assets/icons/plus.svg";
import Refresh from "@/assets/icons/refresh.svg";
import Repeat from "@/assets/icons/repeat.svg";
import Scissors from "@/assets/icons/scissors.svg";
import Search from "@/assets/icons/search.svg";
import SearchBold from "@/assets/icons/search_bold.svg";
import Settings from "@/assets/icons/settings.svg";
import Share from "@/assets/icons/share.svg";
import Star from "@/assets/icons/star.svg";
import StarFilled from "@/assets/icons/star_filled.svg";
import Store from "@/assets/icons/store.svg";
import Sun from "@/assets/icons/sun.svg";
import Sunset from "@/assets/icons/sunset.svg";
import Trash from "@/assets/icons/trash.svg";
import User from "@/assets/icons/user.svg";
import UserBold from "@/assets/icons/user_bold.svg";
import Users from "@/assets/icons/users.svg";
import WifiOff from "@/assets/icons/wifi_off.svg";

export const icons = {
  alert_circle: AlertCircle,
  apple: Apple,
  bell: Bell,
  calendar: Calendar,
  calendar_bold: CalendarBold,
  calendar_check: CalendarCheck,
  camera: Camera,
  chair: Chair,
  check: Check,
  check_bold: CheckBold,
  chevron_down: ChevronDown,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  clock: Clock,
  close: Close,
  eye: Eye,
  eye_off: EyeOff,
  filter: Filter,
  gift: Gift,
  globe: Globe,
  google: Google,
  heart: Heart,
  heart_filled: HeartFilled,
  help_circle: HelpCircle,
  home: Home,
  home_bold: HomeBold,
  lock: Lock,
  logout: Logout,
  map_pin: MapPin,
  message: Message,
  money: Money,
  moon: Moon,
  navigation: Navigation,
  phone: Phone,
  play: Play,
  plus: Plus,
  refresh: Refresh,
  repeat: Repeat,
  scissors: Scissors,
  search: Search,
  search_bold: SearchBold,
  settings: Settings,
  share: Share,
  star: Star,
  star_filled: StarFilled,
  store: Store,
  sun: Sun,
  sunset: Sunset,
  trash: Trash,
  user: User,
  user_bold: UserBold,
  users: Users,
  wifi_off: WifiOff,
} as const;

export type IconName = keyof typeof icons;
