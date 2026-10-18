import { Suspense } from "react";
import { PageContainer } from "@/components/atoms/page-container";
import { METADATA_SEARCH } from "@/lib/data/constants/metadata.constants";
import { SearchBar } from "./__components/search-bar";
import { SearchSkeleton } from "./__components/search-skeleton";
import { SearchView } from "./__components/search-view";

export const metadata = METADATA_SEARCH;

// البحث كله من /branches في المتصفح (SearchView). المواعيد المتاحة وفلاتر الخدمة/المسافة
// بترجع لما يبقى ليها API — مش بنعرض أرقام تجريبية
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  return (
    <div className="flex flex-col">
      <div className="sticky top-[60px] z-30 border-b border-border bg-background">
        <PageContainer className="flex items-center gap-2.5 py-3.5 sm:gap-4">
          {/* key: الحقل يتصفّر لما البحث يتغير من بره (لينك/رجوع) */}
          <SearchBar key={q ?? ""} autoFocus={!q} className="max-w-[480px] flex-1" />
        </PageContainer>
      </div>

      <PageContainer className="flex flex-col gap-5 py-6">
        <Suspense fallback={<SearchSkeleton />}>
          <SearchView />
        </Suspense>
      </PageContainer>
    </div>
  );
}
