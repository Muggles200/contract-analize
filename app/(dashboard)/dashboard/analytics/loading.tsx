import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  Clock,
  Users,
  Activity,
  PieChart,
  LineChart,
  Calendar,
  Target
} from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-blue-500 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-blue-500 rounded w-96 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Time Series Chart Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <LineChart className="w-4 h-4 text-gray-400" />
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance and Cost Analysis Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Analysis Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-28 animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-28 animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Types and Risks Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Type Distribution Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-gray-400" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Risks Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 