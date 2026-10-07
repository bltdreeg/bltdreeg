// حالة النت للتطبيق كله: NetInfo + زرار "اقطع النت" للتجربة من شاشة الـ design system.
// React Query (onlineManager) والـ mock API الاتنين بيقروا من هنا، فالحالتين بيتصرفوا زي بعض.
import NetInfo from "@react-native-community/netinfo";

let netOnline = true;
let simulatedOffline = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const connectivity = {
  isOnline(): boolean {
    return netOnline && !simulatedOffline;
  },

  isSimulatedOffline(): boolean {
    return simulatedOffline;
  },

  setSimulatedOffline(value: boolean): void {
    simulatedOffline = value;
    emit();
  },

  /** بيبدأ يسمع لـ NetInfo؛ بيتنادى من onlineManager مرة واحدة */
  listen(): () => void {
    return NetInfo.addEventListener((state) => {
      // isConnected = null يعني لسه مش عارف — نعتبره متصل بدل ما نقفل الشاشات على الفاضي
      const next = state.isConnected !== false;
      if (next !== netOnline) {
        netOnline = next;
        emit();
      }
    });
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
