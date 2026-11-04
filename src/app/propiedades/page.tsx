import { Suspense } from "react";
import PropertyBrowser from "@/components/PropertyBrowser";

export const metadata = { title: "Propiedades" };

export default function PropertiesPage() {
  return <Suspense><PropertyBrowser /></Suspense>;
}
