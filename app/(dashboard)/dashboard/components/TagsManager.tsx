'use client';

import { useState } from 'react';
import { 
  Tag, 
  Edit3, 
  Save, 
  X, 
  Plus,
  X as CloseIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface TagsManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

export default function TagsManager({ tags, onTagsChange, isEditing = false, onEditToggle }: TagsManagerProps) {
  const [editedTags, setEditedTags] = useState<string[]>(tags);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    try {
      onTagsChange(editedTags);
      if (onEditToggle) {
        onEditToggle();
      }
      toast.success('Tags updated successfully');
    } catch (error) {
      toast.error('Failed to update tags');
    }
  };

  const handleCancel = () => {
    setEditedTags(tags);
    setNewTag('');
    if (onEditToggle) {
      onEditToggle();
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) {
      toast.error('Please enter a tag');
      return;
    }

    if (editedTags.includes(trimmedTag)) {
      toast.error('Tag already exists');
      return;
    }

    setEditedTags([...editedTags, trimmedTag]);
    setNewTag('');
    toast.success('Tag added successfully');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
    toast.success('Tag removed successfully');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const suggestedTags = [
    'important', 'urgent', 'review', 'approved', 'pending',
    'vendor', 'client', 'partnership', 'employment', 'service',
    'confidential', 'public', 'draft', 'final', 'archived'
  ];

  const filteredSuggestedTags = suggestedTags.filter(
    tag => !editedTags.includes(tag)
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Tags
        </h3>
        {!isEditing ? (
          <button
            onClick={onEditToggle}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Tags Display */}
      <div className="space-y-4">
        {isEditing ? (
          <>
            {/* Current Tags */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Tags</h4>
              {editedTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {editedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tags added yet</p>
              )}
            </div>

            {/* Add New Tag */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Tag</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter tag name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddTag}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Suggested Tags */}
            {filteredSuggestedTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {filteredSuggestedTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setEditedTags([...editedTags, tag]);
                        toast.success(`Added tag: ${tag}`);
                      }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Read-only Tags Display */
          <div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No tags added</p>
                <button
                  onClick={onEditToggle}
                  className="mt-2 inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tags
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tag Statistics */}
      {!isEditing && tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {tags.length} tag{tags.length !== 1 ? 's' : ''} • 
            {tags.some(tag => ['important', 'urgent'].includes(tag)) && ' Contains priority tags'}
          </p>
        </div>
      )}
    </div>
  );
} 