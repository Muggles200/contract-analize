import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import GeneralSettings from "../components/GeneralSettings";
import SecuritySettings from "../components/SecuritySettings";
import PrivacySettings from "../components/PrivacySettings";
import DataExport from "../components/DataExport";
import AccountDeletion from "../components/AccountDeletion";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch user data for settings
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
        <p className="text-blue-100">
          Manage your account preferences, security settings, and data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              General Settings
            </h2>
            <GeneralSettings user={user} />
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Security Settings
            </h2>
            <SecuritySettings user={user} />
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Privacy Settings
            </h2>
            <PrivacySettings user={user} />
          </div>

          {/* Data Export */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Data Export
            </h2>
            <DataExport user={user} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Settings Navigation
            </h3>
            <nav className="space-y-2">
              <a href="#general" className="block text-sm text-blue-600 hover:text-blue-800">
                General Settings
              </a>
              <a href="#security" className="block text-sm text-blue-600 hover:text-blue-800">
                Security Settings
              </a>
              <a href="#privacy" className="block text-sm text-blue-600 hover:text-blue-800">
                Privacy Settings
              </a>
              <a href="#api-keys" className="block text-sm text-blue-600 hover:text-blue-800">
                API Keys
              </a>
              <a href="#data-export" className="block text-sm text-blue-600 hover:text-blue-800">
                Data Export
              </a>
            </nav>
          </div>

          {/* Account Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Summary
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Account ID</p>
                <p className="text-sm font-medium text-gray-900 font-mono">
                  {user.id.slice(0, 8)}...
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member since</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Account Deletion */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Danger Zone
            </h3>
            <AccountDeletion />
          </div>
        </div>
      </div>
    </div>
  );
} 