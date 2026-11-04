"use client";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { UserIcon } from "./Icons";

export default function AccountButton() {
  const { profile, loading } = useAuth();
  if (loading || !profile) {
    return <Link className="btn btn--primary btn--sm" href="/ingresar"><UserIcon size={16} /> <span>Ingresar</span></Link>;
  }
  const first = profile.fullName.split(" ")[0] || "Mi cuenta";
  return (
    <div className="account-actions">
      {profile.role === "admin" && <Link className="btn btn--outline btn--sm" href="/admin">Panel</Link>}
      <Link className="btn btn--primary btn--sm" href="/cuenta"><UserIcon size={16} /> <span>{first}</span></Link>
    </div>
  );
}
