import { Suspense } from "react";
import AccountPage from "@/components/AccountPage";

export const metadata = { title: "Mi cuenta" };

export default function Page() {
  return <Suspense><AccountPage /></Suspense>;
}
