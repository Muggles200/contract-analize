import { Building, Users, Settings, CreditCard, Activity } from 'lucide-react';

export default function OrganizationDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex space-x-8">
            {[
              { icon: Building, name: 'Organization Info' },
              { icon: Users, name: 'Member Management' },
              { icon: Settings, name: 'Settings' },
              { icon: CreditCard, name: 'Billing Info' },
              { icon: Activity, name: 'Activity Log' },
            ].map((tab, i) => {
              const Icon = tab.icon;
              return (
                <div key={i} className="py-2 px-1 border-b-2 border-blue-500">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">{tab.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                        <div className="h-16 bg-gray-200 rounded w-full animate-pulse"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                          <div>
                            <div className="h-6 bg-gray-200 rounded w-8 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-5 bg-gray-200 rounded w-16 mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 