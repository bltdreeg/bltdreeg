// سياسة الإلغاء والاسترداد — نص مؤقت لحد ما المحامي يسلّم النص النهائي
import { LegalDocument } from "@/components/molecules/legal-document";
import { REFUND_POLICY_CONTENT } from "@/lib/data/constants/legal.constants";
import { METADATA_REFUND_POLICY } from "@/lib/data/constants/metadata.constants";

export const metadata = METADATA_REFUND_POLICY;

export default function RefundPolicyPage() {
  return <LegalDocument content={REFUND_POLICY_CONTENT} />;
}
