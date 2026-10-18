"use client";

// بياناتي — بتقرا العميل من /me وبتعرض الفورم لما يتحمّل
import { Skeleton } from "@/components/atoms/skeleton";
import { useUser } from "@/lib/hooks/user";
import { ProfileForm } from "./profile-form";

export function ProfileView() {
  const { user, isLoading } = useUser();

  if (isLoading || !user) {
    return (
      <div role="status" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Skeleton className="h-56 rounded-[14px] lg:col-span-4" />
        <Skeleton className="h-[460px] rounded-[14px] lg:col-span-8" />
      </div>
    );
  }

  return <ProfileForm user={user} />;
}
