import { FileText, Download, Calendar, Settings, BarChart3, Clock } from 'lucide-react';

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-purple-500 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-96 bg-purple-500 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Report Generator Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Template Selection Skeleton */}
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Type Selection Skeleton */}
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Selection Skeleton */}
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Summary Skeleton */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Generate Button Skeleton */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Report Templates Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-1 animate-pulse"></div>
                <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scheduled Reports and Export Options Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Reports Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
              <div className="h-5 w-32 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Export Options Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Export Format Skeleton */}
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                        <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Method Skeleton */}
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Summary Skeleton */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button Skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Report History Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, j) => (
                          <div key={j}>
                            <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 