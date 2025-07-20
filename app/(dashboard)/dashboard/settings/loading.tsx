import { Loader2 } from "lucide-react";

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="h-8 bg-blue-500 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-blue-500 rounded w-2/3 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/6 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/6 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="pt-4">
                <div className="h-10 bg-blue-600 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Security Settings Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* API Keys Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-blue-600 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Data Export Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Settings Navigation Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Account Summary Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Deletion Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-10 bg-red-600 rounded w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 