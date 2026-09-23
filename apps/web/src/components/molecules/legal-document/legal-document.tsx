// صفحة قانونية ثابتة: عنوان + تنبيه النص المؤقت + أقسام مرقمة
import { PageContainer } from "@/components/atoms/page-container";
import {
  LEGAL_DRAFT_NOTICE,
  LEGAL_VERSION,
  type LegalDocumentContent,
} from "@/lib/data/constants/legal.constants";

export function LegalDocument({ content }: { content: LegalDocumentContent }) {
  return (
    <PageContainer className="py-8 sm:py-12 max-w-3xl">
      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-foreground">{content.title}</h1>
          <p className="text-sm text-muted-foreground">{content.intro}</p>
          <p className="text-xs text-muted-foreground">إصدار {LEGAL_VERSION}</p>
        </header>

        <p
          role="note"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
        >
          {LEGAL_DRAFT_NOTICE}
        </p>

        <ol className="flex flex-col gap-5">
          {content.sections.map((section, index) => (
            <li key={section.title} className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-foreground">
                {index + 1}. {section.title}
              </h2>
              <p className="text-sm leading-7 text-foreground/80">{section.body}</p>
            </li>
          ))}
        </ol>
      </article>
    </PageContainer>
  );
}
