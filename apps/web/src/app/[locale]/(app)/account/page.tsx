// حسابي
import { METADATA_ACCOUNT } from "@/lib/data/constants/metadata.constants";
import { AccountMenu } from "./__components/account-menu";

export const metadata = METADATA_ACCOUNT;

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">حسابي</h1>
      <AccountMenu />
    </main>
  );
}
