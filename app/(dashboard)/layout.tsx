import { auth, currentUser, User } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import DashboardNav from "./components/DashboardNav";
import DashboardSidebar from "./components/DashboardSidebar";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const user = await currentUser();
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user as User} />
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