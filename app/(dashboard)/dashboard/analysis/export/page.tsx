import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AnalysisExportForm from "./components/AnalysisExportForm";
import ExportHistory from "./components/ExportHistory";

export default async function AnalysisExportPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch user's analyses for export
  const analyses = await prisma.analysisResult.findMany({
    where: { 
      userId: session.user.id 
    },
    orderBy: { createdAt: 'desc' },
    include: {
      contract: {
        select: {
          fileName: true,
          fileSize: true,
          metadata: true,
        }
      }
    }
  }).then(analyses => analyses.map(analysis => ({
    ...analysis,
    contract: {
      ...analysis.contract,
      fileSize: Number(analysis.contract.fileSize)
    }
  })));

  // Fetch recent export history
  const exportHistory = await prisma.userActivity.findMany({
    where: {
      userId: session.user.id,
      activityType: { in: ['analysis_exported', 'contracts_exported'] }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  }).then(activities => activities
    .filter(activity => activity.description !== null)
    .map(activity => ({
      ...activity,
      description: activity.description!
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Analysis Results</h1>
        <p className="text-gray-600">
          Export your analysis results in various formats for reporting and sharing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Form */}
        <div>
          <AnalysisExportForm analyses={analyses} />
        </div>

        {/* Export History */}
        <div>
          <ExportHistory exportHistory={exportHistory} />
        </div>
      </div>
    </div>
  );
} 