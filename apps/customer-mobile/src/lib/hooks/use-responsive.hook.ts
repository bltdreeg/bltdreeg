// المقاسات الحالية — بيتحدث مع الدوران و split-screen والأجهزة القابلة للطي (مفيش قيم متخزنة وقت التحميل)
import { useWindowDimensions } from "react-native";
import { metrics } from "@/styles/responsive";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return metrics(width, height);
}
