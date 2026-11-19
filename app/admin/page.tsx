import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { AdminConsole } from "./AdminConsole";

// middleware.ts already rewrites any unauthenticated request for this route
// to /admin-login before this ever runs — this check is defense-in-depth in
// case that matcher is ever changed, not the primary gate.
export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const authorized = await verifyAdminSessionToken(token);
  if (!authorized) {
    redirect("/admin-login");
  }
  return <AdminConsole />;
}
