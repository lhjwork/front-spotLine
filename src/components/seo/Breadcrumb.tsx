import JsonLd from "./JsonLd";
import { generateBreadcrumbJsonLd } from "@/lib/seo/jsonld";

interface BreadcrumbProps {
  items: Array<{ name: string; url?: string }>;
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbItems = [{ name: "홈", url: "/" }, ...items];
  return <JsonLd data={generateBreadcrumbJsonLd(breadcrumbItems)} />;
}
