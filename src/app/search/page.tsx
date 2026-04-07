import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import SearchPageClient from "./SearchPageClient";

export const metadata = {
  title: "검색 - Spotline",
  description: "Spot과 SpotLine을 검색하세요",
};

export default function SearchPage() {
  return (
    <Layout showBackButton>
      <Suspense fallback={null}>
        <SearchPageClient />
      </Suspense>
    </Layout>
  );
}
