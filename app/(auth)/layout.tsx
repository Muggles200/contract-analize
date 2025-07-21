import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ContractAnalyze</span>
          </Link>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to ContractAnalyze
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          AI-powered contract analysis for modern businesses
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
} 