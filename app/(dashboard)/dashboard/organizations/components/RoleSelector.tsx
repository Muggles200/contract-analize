'use client';

import { Crown, Shield, User } from 'lucide-react';

interface RoleOption {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RoleSelectorProps {
  value: string;
  onChange: (role: string) => void;
  options?: RoleOption[];
  disabled?: boolean;
  showOwner?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function RoleSelector({
  value,
  onChange,
  options,
  disabled = false,
  showOwner = false,
  className = '',
  size = 'md'
}: RoleSelectorProps) {
  const defaultOptions: RoleOption[] = [
    {
      value: 'member',
      label: 'Member',
      description: 'Can view and contribute to organization resources',
      icon: User,
      color: 'text-blue-600'
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Can manage members and organization settings',
      icon: Shield,
      color: 'text-red-600'
    },
    ...(showOwner ? [{
      value: 'owner',
      label: 'Owner',
      description: 'Full control over the organization',
      icon: Crown,
      color: 'text-yellow-600'
    }] : [])
  ];

  const roleOptions = options || defaultOptions;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-2 text-sm';
      case 'lg':
        return 'p-4 text-base';
      default:
        return 'p-3 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {roleOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        
        return (
          <label
            key={option.value}
            className={`flex items-center ${getSizeClasses()} border rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="role"
              value={option.value}
              checked={isSelected}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
              disabled={disabled}
            />
            <div className="flex items-center space-x-3">
              <Icon className={`${getIconSize()} ${
                isSelected ? option.color : 'text-gray-400'
              }`} />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500">
                  {option.description}
                </div>
              </div>
              {isSelected && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}

// Export role options for reuse
export const roleOptions = [
  {
    value: 'member',
    label: 'Member',
    description: 'Can view and contribute to organization resources',
    icon: User,
    color: 'text-blue-600'
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Can manage members and organization settings',
    icon: Shield,
    color: 'text-red-600'
  },
  {
    value: 'owner',
    label: 'Owner',
    description: 'Full control over the organization',
    icon: Crown,
    color: 'text-yellow-600'
  }
];

// Helper function to get role color
export const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'owner':
      return 'bg-yellow-100 text-yellow-800';
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'member':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get role icon
export const getRoleIcon = (role: string, className = 'w-4 h-4') => {
  switch (role.toLowerCase()) {
    case 'owner':
      return <Crown className={`${className} text-yellow-600`} />;
    case 'admin':
      return <Shield className={`${className} text-red-600`} />;
    case 'member':
      return <User className={`${className} text-blue-600`} />;
    default:
      return <User className={`${className} text-gray-600`} />;
  }
}; 