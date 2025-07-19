'use client';

import Link from 'next/link';
import { Upload, FileText, Brain, BarChart3, Settings, Users } from 'lucide-react';

const actions = [
  {
    name: 'Upload Contract',
    description: 'Upload a new contract for analysis',
    href: '/dashboard/upload',
    icon: Upload,
    color: 'bg-blue-50 text-blue-600',
    bgColor: 'hover:bg-blue-50'
  },
  {
    name: 'View Contracts',
    description: 'Browse all your contracts',
    href: '/dashboard/contracts',
    icon: FileText,
    color: 'bg-green-50 text-green-600',
    bgColor: 'hover:bg-green-50'
  },
  {
    name: 'Start Analysis',
    description: 'Analyze a contract with AI',
    href: '/dashboard/analysis',
    icon: Brain,
    color: 'bg-purple-50 text-purple-600',
    bgColor: 'hover:bg-purple-50'
  },
  {
    name: 'View Analytics',
    description: 'Check your usage and insights',
    href: '/dashboard/analytics',
    icon: BarChart3,
    color: 'bg-orange-50 text-orange-600',
    bgColor: 'hover:bg-orange-50'
  },
  {
    name: 'Manage Team',
    description: 'Invite team members',
    href: '/dashboard/organizations',
    icon: Users,
    color: 'bg-indigo-50 text-indigo-600',
    bgColor: 'hover:bg-indigo-50'
  },
  {
    name: 'Settings',
    description: 'Configure your account',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'bg-gray-50 text-gray-600',
    bgColor: 'hover:bg-gray-50'
  }
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <p className="text-sm text-gray-500 mt-1">Common tasks and shortcuts</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                href={action.href}
                className={`flex items-center space-x-4 p-4 rounded-lg border border-gray-200 transition-all duration-200 ${action.bgColor} hover:border-gray-300 hover:shadow-sm`}
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 