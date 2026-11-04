import { Suspense } from "react";
import PropertyEditor from "@/components/admin/PropertyEditor";

export const metadata = { title: "Mi propiedad", robots: { index: false } };

export default function Page() {
  return <Suspense><PropertyEditor mode="seller" /></Suspense>;
}
