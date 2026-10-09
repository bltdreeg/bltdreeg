// روابط خارجية زي ExternalLinks في Flutter: الخرايط والاتصال — لو مفيش تطبيق يفتحها: توست cantOpenApp
import { Linking, Platform } from "react-native";
import { showToast } from "./toast-bus";

const open = (url: string) => void Linking.openURL(url).catch(() => showToast("common.cantOpenApp"));

export const openDirections = (latitude: number, longitude: number, label: string) =>
  open(
    Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(label)}@${latitude},${longitude}`,
      default: `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(label)})`,
    }),
  );

export const callPhone = (phone: string) => open(`tel:${phone}`);
