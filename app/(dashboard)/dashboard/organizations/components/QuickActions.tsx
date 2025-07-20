'use client';

import Link from 'next/link';
import { 
  Plus, 
  Users, 
  Settings, 
  FileText, 
  Brain, 
  TrendingUp,
  UserPlus,
  Building
} from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      title: 'Create Organization',
      description: 'Start a new organization',
      icon: Plus,
      href: '#',
      onClick: () => {
        // This will be handled by the parent component
        const event = new CustomEvent('openCreateModal');
        window.dispatchEvent(event);
      },
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Invite Members',
      description: 'Add team members to organizations',
      icon: UserPlus,
      href: '/dashboard/organizations/invite',
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Organization Settings',
      description: 'Manage organization preferences',
      icon: Settings,
      href: '/dashboard/organizations/settings',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'View Contracts',
      description: 'Browse organization contracts',
      icon: FileText,
      href: '/dashboard/contracts',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      title: 'Analysis History',
      description: 'Review past analyses',
      icon: Brain,
      href: '/dashboard/analysis',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Analytics',
      description: 'View organization metrics',
      icon: TrendingUp,
      href: '/dashboard/analytics',
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.title}
              className={`relative group cursor-pointer bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300`}
            >
              {action.onClick ? (
                <button
                  onClick={action.onClick}
                  className="w-full text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                      <Icon className={`w-5 h-5 ${action.textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              ) : (
                <Link href={action.href} className="block">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                      <Icon className={`w-5 h-5 ${action.textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 