'use client';

import { useState } from 'react';
import { Download, Share2, Copy, Check } from 'lucide-react';

interface ReportActionsProps {
  template: string;
  dateRange: string;
  reportType: string;
  organizationId?: string;
}

export default function ReportActions({ template, dateRange, reportType, organizationId }: ReportActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      console.log('Downloading report:', {
        template,
        dateRange,
        reportType,
        organizationId,
      });

      // Call the API to generate PDF
      const response = await fetch('/api/reports/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template,
          dateRange,
          reportType,
          organizationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template}-report-${dateRange}-${reportType}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Generate share URL
      const shareUrl = `${window.location.origin}/dashboard/reports/preview?template=${template}&dateRange=${dateRange}&type=${reportType}${organizationId ? `&organizationId=${organizationId}` : ''}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
      
      console.log('Share URL copied to clipboard:', shareUrl);
    } catch (error) {
      console.error('Error sharing report:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
      >
        {isSharing ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <span>Sharing...</span>
          </>
        ) : shareCopied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </>
        )}
      </button>
      
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </>
        )}
      </button>
    </div>
  );
} 