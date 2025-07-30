import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import BatchAnalysisForm from "./components/BatchAnalysisForm";
import BatchAnalysisStatus from "./components/BatchAnalysisStatus";

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
        <div>
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