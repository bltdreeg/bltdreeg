// سياسة الخصوصية — نص مؤقت لحد ما المحامي يسلّم النص النهائي
import { LegalDocument } from "@/components/molecules/legal-document";
import { PRIVACY_CONTENT } from "@/lib/data/constants/legal.constants";
import { METADATA_PRIVACY } from "@/lib/data/constants/metadata.constants";

export const metadata = METADATA_PRIVACY;

export default function PrivacyPage() {
  return <LegalDocument content={PRIVACY_CONTENT} />;
}
