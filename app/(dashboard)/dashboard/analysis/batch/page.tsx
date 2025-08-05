import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import BatchAnalysisForm from "./components/BatchAnalysisForm";
import BatchAnalysisStatus from "./components/BatchAnalysisStatus";
import { AlertTriangle } from "lucide-react";

export default async function BatchAnalysisPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch user's contracts for batch analysis
  const contracts = await prisma.contract.findMany({
    where: { 
      userId: session.user.id, 
      deletedAt: null 
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fileName: true,
      fileSize: true,
      createdAt: true,
      metadata: true,
      analysisResults: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          status: true,
          analysisType: true,
          createdAt: true,
        }
      }
    }
  }).then(contracts => contracts.map(contract => ({
    ...contract,
    fileSize: Number(contract.fileSize)
  })));

  // Fetch recent batch analysis jobs
  const recentBatchJobs = await prisma.analysisResult.findMany({
    where: { 
      userId: session.user.id,
      customParameters: {
        path: ['batchJob'],
        equals: true
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      contract: {
        select: {
          fileName: true,
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Batch Analysis</h1>
        <p className="text-gray-600">
          Analyze multiple contracts simultaneously with AI-powered contract analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Analysis Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Batch Processing Warning */}
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  ⚠️ Batch Processing &amp; Legal Disclaimer
                </p>
                <p className="text-sm text-red-700">
                  Batch analysis will process multiple contracts simultaneously. This may take longer and consume more of your monthly analysis quota. 
                  <strong>Analysis results are for informational purposes only and do NOT constitute legal advice.</strong> 
                  Always consult with a qualified attorney for legal matters. Ensure all contracts are ready for processing before starting.
                </p>
              </div>
            </div>
          </div>
          <BatchAnalysisForm contracts={contracts} />
        </div>

        {/* Batch Analysis Status */}
        <div>
          <BatchAnalysisStatus recentJobs={recentBatchJobs} />
        </div>
      </div>
    </div>
  );
} 