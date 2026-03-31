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

  return {
    title: `${profile.nickname}의 프로필`,
    description: profile.bio || `${profile.nickname}의 Spotline 프로필`,
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
