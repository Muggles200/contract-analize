'use client';

import { useState } from 'react';
import { 
  Share2, 
  Mail, 
  Link, 
  Copy, 
  Users, 
  Lock, 
  Globe,
  Check,
  Loader2,
  X,
  Eye,
  MessageSquare,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareAnalysisProps {
  analysisId: string;
}

const shareOptions = [
  {
    id: 'email',
    name: 'Email Link',
    description: 'Send analysis link via email',
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'link',
    name: 'Copy Link',
    description: 'Copy shareable link to clipboard',
    icon: Link,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'team',
    name: 'Share with Team',
    description: 'Share with organization members',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

const permissionLevels = [
  {
    id: 'view',
    name: 'View Only',
    description: 'Can view analysis results',
    icon: Eye,
    color: 'text-gray-600'
  },
  {
    id: 'comment',
    name: 'Comment',
    description: 'Can view and add comments',
    icon: MessageSquare,
    color: 'text-blue-600'
  },
  {
    id: 'edit',
    name: 'Edit',
    description: 'Can view, comment, and edit',
    icon: Edit,
    color: 'text-green-600'
  }
];

export default function ShareAnalysis({ analysisId }: ShareAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareType, setShareType] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/dashboard/analysis/${analysisId}/shared`;
    return shareUrl;
  };

  const handleShare = async (type: string) => {
    setShareType(type);
    
    if (type === 'link') {
      const link = generateShareLink();
      setShareLink(link);
      try {
        await navigator.clipboard.writeText(link);
        toast.success('Share link copied to clipboard');
        setIsOpen(false);
      } catch (error) {
        toast.error('Failed to copy link');
      }
    } else if (type === 'email') {
      // Email sharing will be handled in the modal
    } else if (type === 'team') {
      // Team sharing will be handled in the modal
    }
  };

  const handleEmailShare = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSharing(true);
    
    try {
      const response = await fetch(`/api/analysis/${analysisId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'email',
          email,
          permission,
          message
        }),
      });

      if (response.ok) {
        toast.success('Analysis shared successfully');
        setIsOpen(false);
        setEmail('');
        setMessage('');
      } else {
        throw new Error('Failed to share analysis');
      }
    } catch (error) {
      toast.error('Failed to share analysis');
    } finally {
      setIsSharing(false);
    }
  };

  const handleTeamShare = async () => {
    setIsSharing(true);
    
    try {
      const response = await fetch(`/api/analysis/${analysisId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'team',
          permission,
          message
        }),
      });

      if (response.ok) {
        toast.success('Analysis shared with team successfully');
        setIsOpen(false);
        setMessage('');
      } else {
        throw new Error('Failed to share analysis');
      }
    } catch (error) {
      toast.error('Failed to share analysis');
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="relative">
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Modal */}
          <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Share Analysis</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!shareType ? (
                // Share Options
                <div className="space-y-2">
                  {shareOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleShare(option.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors hover:bg-gray-50 ${option.bgColor} ${option.borderColor}`}
                    >
                      <option.icon className={`w-5 h-5 ${option.color}`} />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{option.name}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : shareType === 'email' ? (
                // Email Share Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permission Level
                    </label>
                    <select
                      value={permission}
                      onChange={(e) => setPermission(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {permissionLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a personal message..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleEmailShare}
                      disabled={isSharing || !email}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSharing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Send
                    </button>
                    <button
                      onClick={() => setShareType(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : shareType === 'team' ? (
                // Team Share Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permission Level
                    </label>
                    <select
                      value={permission}
                      onChange={(e) => setPermission(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {permissionLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a message for your team..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleTeamShare}
                      disabled={isSharing}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSharing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Users className="w-4 h-4 mr-2" />
                      )}
                      Share with Team
                    </button>
                    <button
                      onClick={() => setShareType(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : shareType === 'link' ? (
                // Link Share
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Share Link
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={copyShareLink}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShareType(null)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 