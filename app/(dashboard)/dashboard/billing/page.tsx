import { redirect } from "next/navigation";
import { 
  CreditCard, 
  TrendingUp, 
  FileText, 
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Infinity,
  Users,
  Zap,
  Info
} from "lucide-react";
import SubscriptionCard from "./components/SubscriptionCard";
import UsageMeter from "./components/UsageMeter";
import UsageLimits from "./components/UsageLimits";
import BillingHistory from "./components/BillingHistory";
import PlanComparison from "./components/PlanComparison";
import PaymentMethods from "./components/PaymentMethods";
import { auth } from "@/auth";

export default async function BillingDashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      {/* Billing Information Warning */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Billing Information
            </p>
            <p className="text-sm text-blue-700">
              Plan changes take effect immediately. Downgrading may affect your current usage limits. Cancelled subscriptions remain active until the end of the current billing period.
            </p>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Billing & Subscription
            </h1>
            <p className="text-blue-100">
              Manage your subscription, view usage, and download invoices.
            </p>
          </div>
          <CreditCard className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Subscription */}
        <div className="lg:col-span-2">
          <SubscriptionCard />
        </div>

        {/* Usage Statistics */}
        <div className="space-y-6">
          <UsageMeter />
          <UsageLimits />
        </div>
      </div>

      {/* Plan Comparison */}
      <PlanComparison />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing History */}
        <BillingHistory />

        {/* Payment Methods */}
        <PaymentMethods />
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Need Help?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Billing Support</h4>
              <p className="text-sm text-gray-600">
                Contact our support team for billing questions
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Usage Limits</h4>
              <p className="text-sm text-gray-600">
                Learn about your plan's usage limits and restrictions
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Download className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Invoice Downloads</h4>
              <p className="text-sm text-gray-600">
                Download your invoices for accounting purposes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 