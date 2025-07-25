import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ProfileForm from "../components/ProfileForm";
import AvatarUpload from "../components/AvatarUpload";
import EmailPreferences from "../components/EmailPreferences";
import NotificationSettings from "../components/NotificationSettings";
import PasswordChange from "../components/PasswordChange";
import AccountDeletion from "../components/AccountDeletion";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch user profile data
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
        <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
        <p className="text-blue-100">
          Manage your account information, preferences, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Profile Information
            </h2>
            <ProfileForm user={user} />
          </div>

          {/* Avatar Upload */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Profile Picture
            </h2>
            <AvatarUpload user={user} />
          </div>

          {/* Email Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Email Preferences
            </h2>
            <EmailPreferences user={user} />
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Notification Settings
            </h2>
            <NotificationSettings user={user} />
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Change Password
            </h2>
            <PasswordChange />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Summary
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Member since</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email status</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.emailVerified ? (
                    <span className="text-green-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Pending verification
                    </span>
                  )}
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