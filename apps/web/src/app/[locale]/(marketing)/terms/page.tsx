// شروط الخدمة — نص مؤقت لحد ما المحامي يسلّم النص النهائي
import { LegalDocument } from "@/components/molecules/legal-document";
import { TERMS_CONTENT } from "@/lib/data/constants/legal.constants";
import { METADATA_TERMS } from "@/lib/data/constants/metadata.constants";

export const metadata = METADATA_TERMS;

export default function TermsPage() {
  return <LegalDocument content={TERMS_CONTENT} />;
}
