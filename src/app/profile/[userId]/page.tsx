import type { Metadata } from "next";
import { fetchUserProfile } from "@/lib/api";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { userId } = await params;
  const profile = await fetchUserProfile(userId);

  if (!profile) {
    return { title: "프로필을 찾을 수 없습니다" };
  }

  const title = `${profile.nickname}의 프로필`;
  const description = profile.bio ||
    `SpotLine ${profile.stats.spotLinesCount}개 · Spot ${profile.stats.spotsCount}개 · 팔로워 ${profile.stats.followers}명`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      ...(profile.avatar && { images: [{ url: profile.avatar, width: 200, height: 200 }] }),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(profile.avatar && { images: [profile.avatar] }),
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const profile = await fetchUserProfile(userId);

  if (!profile) {
    notFound();
  }

  return <ProfileClient profile={profile} />;
}
