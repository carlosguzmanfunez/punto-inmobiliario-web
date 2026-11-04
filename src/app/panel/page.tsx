import { Suspense } from "react";
import SellerDashboard from "@/components/seller/SellerDashboard";

export const metadata = { title: "Panel del vendedor", robots: { index: false } };

export default function Page() {
  return <Suspense><SellerDashboard /></Suspense>;
}
