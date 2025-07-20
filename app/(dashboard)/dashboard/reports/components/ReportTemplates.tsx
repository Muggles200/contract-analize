'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Plus, 
  Settings, 
  Star,
  Copy,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';

interface ReportTemplatesProps {
  currentTemplate: string;
  currentDateRange: string;
  organizationId?: string;
}

export default function ReportTemplates({ 
  currentTemplate, 
  currentDateRange, 
  organizationId 
}: ReportTemplatesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const predefinedTemplates = [
    {
      id: 'overview',
      name: 'Overview Report',
      description: 'High-level summary of contracts and analyses',
      category: 'Standard',
      isFavorite: true,
      isPredefined: true,
    },
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'Analysis performance and processing metrics',
      category: 'Standard',
      isFavorite: false,
      isPredefined: true,
    },
    {
      id: 'cost',
      name: 'Cost Analysis Report',
      description: 'Detailed cost breakdown and token usage',
      category: 'Financial',
      isFavorite: true,
      isPredefined: true,
    },
    {
      id: 'risks',
      name: 'Risk Assessment Report',
      description: 'Risk analysis and mitigation recommendations',
      category: 'Compliance',
      isFavorite: false,
      isPredefined: true,
    },
    {
      id: 'usage',
      name: 'Usage Report',
      description: 'User activity and feature utilization',
      category: 'Analytics',
      isFavorite: false,
      isPredefined: true,
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'Complete analysis with all metrics and insights',
      category: 'Executive',
      isFavorite: true,
      isPredefined: true,
    },
  ];

  const customTemplates = [
    {
      id: 'custom-1',
      name: 'Monthly Executive Summary',
      description: 'Custom monthly report for executive review',
      category: 'Custom',
      isFavorite: true,
      isPredefined: false,
      createdAt: '2024-01-15',
    },
    {
      id: 'custom-2',
      name: 'Quarterly Compliance Review',
      description: 'Quarterly compliance and risk assessment',
      category: 'Custom',
      isFavorite: false,
      isPredefined: false,
      createdAt: '2024-01-10',
    },
  ];

  const allTemplates = [...predefinedTemplates, ...customTemplates];

  const handleTemplateSelect = (templateId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('template', templateId);
    router.push(`/dashboard/reports?${params.toString()}`);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;

    try {
      // In a real implementation, this would save to the database
      console.log('Saving template:', {
        name: templateName,
        description: templateDescription,
        isFavorite,
        currentTemplate,
        currentDateRange,
        organizationId,
      });

      // Reset form
      setTemplateName('');
      setTemplateDescription('');
      setIsFavorite(false);
      setShowSaveTemplate(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      // In a real implementation, this would delete from the database
      console.log('Deleting template:', templateId);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;

    setTemplateName(`${template.name} (Copy)`);
    setTemplateDescription(template.description);
    setIsFavorite(template.isFavorite);
    setShowSaveTemplate(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Standard':
        return 'bg-blue-100 text-blue-800';
      case 'Financial':
        return 'bg-green-100 text-green-800';
      case 'Compliance':
        return 'bg-red-100 text-red-800';
      case 'Analytics':
        return 'bg-purple-100 text-purple-800';
      case 'Executive':
        return 'bg-indigo-100 text-indigo-800';
      case 'Custom':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Report Templates</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSaveTemplate(true)}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Save Template</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Save Template Modal */}
        {showSaveTemplate && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-blue-900">Save Current Configuration as Template</h3>
              <button
                onClick={() => setShowSaveTemplate(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Enter template description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFavorite"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isFavorite" className="text-sm text-gray-700">
                  Mark as favorite
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  Save Template
                </button>
                <button
                  onClick={() => setShowSaveTemplate(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTemplates.map((template) => {
            const isSelected = currentTemplate === template.id;
            
            return (
              <div
                key={template.id}
                className={`p-4 border rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {template.isFavorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    {!template.isPredefined && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateTemplate(template.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className={`font-medium mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {template.name}
                </h3>
                <p className={`text-sm mb-2 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                  {template.description}
                </p>
                
                {!template.isPredefined && template.createdAt && (
                  <p className="text-xs text-gray-400">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Template Categories */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Template Categories</h3>
          <div className="flex flex-wrap gap-2">
            {['All', 'Standard', 'Financial', 'Compliance', 'Analytics', 'Executive', 'Custom'].map((category) => (
              <button
                key={category}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 