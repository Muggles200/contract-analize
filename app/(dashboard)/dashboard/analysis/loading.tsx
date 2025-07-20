import { Brain, Clock, CheckCircle, XCircle } from "lucide-react";

export default function AnalysisDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-white/20 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-96 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Brain className="w-8 h-8" />
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white/20 rounded animate-pulse"></div>
                <div className="w-4 h-4 bg-white/20 rounded animate-pulse"></div>
                <div className="w-16 h-3 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg animate-pulse">
                <div className="w-6 h-6"></div>
              </div>
            </div>
            <div className="flex items-center mt-4 space-x-2">
              <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Status Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Progress Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
                <div className="flex justify-between mt-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analyses Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Statistics Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 