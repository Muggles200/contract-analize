'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Upload, X, Loader2 } from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AvatarUploadProps {
  user: User;
}

export default function AvatarUpload({ user }: AvatarUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.image || null);

  // Cleanup preview URL when component unmounts or previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clean up previous preview URL if it's a blob URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    // Validate image dimensions
    const img = new Image();
    const validationUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(validationUrl);
      
      // Check minimum dimensions (100x100)
      if (img.width < 100 || img.height < 100) {
        setMessage({ type: 'error', text: 'Image must be at least 100x100 pixels' });
        return;
      }
      
      // Check maximum dimensions (2048x2048)
      if (img.width > 2048 || img.height > 2048) {
        setMessage({ type: 'error', text: 'Image must be no larger than 2048x2048 pixels' });
        return;
      }
      
      // Create preview URL (separate from validation URL)
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setMessage(null);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(validationUrl);
      setMessage({ type: 'error', text: 'Invalid image file' });
    };
    
    img.src = validationUrl;
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: 'error', text: 'Please select an image to upload' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        // Update preview with the new URL from the server
        if (data.imageUrl) {
          setPreviewUrl(data.imageUrl);
        }
        router.refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile picture' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while uploading the image' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setPreviewUrl(null);
        setMessage({ type: 'success', text: 'Profile picture removed successfully!' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove profile picture' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while removing the image' });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={user.name || 'Profile picture'}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {getInitials(user.name, user.email)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {user.name || 'User'}
          </h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Upload New Picture
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            JPG, PNG, or GIF. Max size 5MB. Min 100x100px, Max 2048x2048px.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleUpload}
            disabled={isLoading || !fileInputRef.current?.files?.length}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Picture
              </>
            )}
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
} 