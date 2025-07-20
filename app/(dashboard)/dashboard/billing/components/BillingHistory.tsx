'use client';

import { useState, useEffect } from 'react';
import { 
  Receipt, 
  Download, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock,
  ExternalLink
} from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  description: string;
  pdfUrl: string | null;
  hostedInvoiceUrl: string | null;
}

export default function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async (offset = 0) => {
    try {
      const response = await fetch(`/api/billing/invoices?limit=10&offset=${offset}`);
      if (response.ok) {
        const data = await response.json();
        if (offset === 0) {
          setInvoices(data.invoices);
        } else {
          setInvoices(prev => [...prev, ...data.invoices]);
        }
        setHasMore(data.hasMore);
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (err) {
      setError('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    } else if (invoice.hostedInvoiceUrl) {
      window.open(invoice.hostedInvoiceUrl, '_blank');
    } else {
      // In a real implementation, you would generate and download the PDF
      console.log('Downloading invoice:', invoice.number);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    if (invoice.hostedInvoiceUrl) {
      window.open(invoice.hostedInvoiceUrl, '_blank');
    } else {
      // In a real implementation, you would show the invoice in a modal or new page
      console.log('Viewing invoice:', invoice.number);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Invoices
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchInvoices()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Receipt className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Billing History
            </h3>
            <p className="text-sm text-gray-600">
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-8">
          <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Invoices Found
          </h3>
          <p className="text-gray-600">
            Your billing history will appear here once you have an active subscription.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(invoice.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {invoice.number}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewInvoice(invoice)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="View invoice"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(invoice)}
                    className="text-gray-600 hover:text-gray-700 p-1"
                    title="Download invoice"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(invoice.created)}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {invoice.description}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-3 w-3" />
                  <span>Due: {formatDate(invoice.dueDate)}</span>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchInvoices(invoices.length)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Load More Invoices
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 