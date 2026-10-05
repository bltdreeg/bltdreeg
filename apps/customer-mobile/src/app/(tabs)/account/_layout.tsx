import { Stack } from "expo-router";
import { useSession } from "@/lib/hooks/use-session.hook";

export default function AccountLayout() {
  const { hasSession } = useSession();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={hasSession}>
        <Stack.Screen name="profile" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="notification-settings" />
      </Stack.Protected>
    </Stack>
  );
}
