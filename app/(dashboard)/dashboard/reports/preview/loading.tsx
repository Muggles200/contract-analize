import { FileText, Download, Share2, ArrowLeft, Calendar, Clock } from 'lucide-react';

export default function ReportPreviewLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <ArrowLeft className="w-4 h-4" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-5 w-96 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="flex items-center space-x-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 w-20 bg-gray-200 rounded mb-1 animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Executive Summary Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Risk Assessment Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 