import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardNav from "./components/DashboardNav";
import DashboardSidebar from "./components/DashboardSidebar";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={session.user as any} />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
} 