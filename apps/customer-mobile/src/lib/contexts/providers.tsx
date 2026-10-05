import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { IntlProvider } from "use-intl";
import { messages, type Locale } from "@/i18n/config";

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={locale} messages={messages[locale]} timeZone="Africa/Cairo">
        {children}
      </IntlProvider>
    </QueryClientProvider>
  );
}
