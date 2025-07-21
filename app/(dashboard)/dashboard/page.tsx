import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { 
  FileText, 
  Brain, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Upload,
  BarChart3,
  Users,
  DollarSign
} from "lucide-react";
import DashboardStats from "./components/DashboardStats";
import RecentContracts from "./components/RecentContracts";
import RecentAnalyses from "./components/RecentAnalyses";
import UsageMetrics from "./components/UsageMetrics";
import QuickActions from "./components/QuickActions";
import NotificationsPanel from "./components/NotificationsPanel";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const user = await currentUser();

  // Fetch dashboard data
  const [
    contractsCount,
    analysesCount,
    recentContracts,
    recentAnalyses,
    usageStats
  ] = await Promise.all([
    // Total contracts count
    prisma.contract.count({
      where: { userId, deletedAt: null }
    }),
    
    // Total analyses count
    prisma.analysisResult.count({
      where: { userId }
    }),
    
    // Recent contracts
    prisma.contract.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        analysisResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    }),
    
    // Recent analyses
    prisma.analysisResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        contract: true
      }
    }),
    
    // Usage statistics for the current month
    prisma.usageLog.groupBy({
      by: ['action'],
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      }
    })
  ]);

  // Calculate usage metrics
  const uploadsThisMonth = usageStats.find(stat => stat.action === 'contract_upload')?._count.action || 0;
  const analysesThisMonth = usageStats.find(stat => stat.action === 'analysis_started')?._count.action || 0;

  const stats = [
    {
      title: "Total Contracts",
      value: contractsCount,
      change: "+12%",
      changeType: "positive" as const,
      icon: "FileText",
      color: "blue"
    },
    {
      title: "Total Analyses",
      value: analysesCount,
      change: "+8%",
      changeType: "positive" as const,
      icon: "Brain",
      color: "green"
    },
    {
      title: "Uploads This Month",
      value: uploadsThisMonth,
      change: "+15%",
      changeType: "positive" as const,
      icon: "Upload",
      color: "purple"
    },
    {
      title: "Analyses This Month",
      value: analysesThisMonth,
      change: "+5%",
      changeType: "positive" as const,
      icon: "BarChart3",
      color: "orange"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.username || 'User'}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your contracts and analyses today.
        </p>
      </div>

      {/* Quick Stats Overview */}
      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contracts */}
        <div className="lg:col-span-2">
          <RecentContracts contracts={recentContracts} />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
          <NotificationsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analyses */}
        <RecentAnalyses analyses={recentAnalyses as any} />
        
        {/* Usage Metrics */}
        <UsageMetrics usageStats={usageStats} />
      </div>
    </div>
  );
} 