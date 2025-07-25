'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  Save, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  QrCode,
  Key,
  Clock,
  MapPin,
  Globe,
  Activity,
  Lock,
  Unlock,
  Trash2,
  Download,
  Copy,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SecuritySettingsProps {
  user: User;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'totp' | 'sms' | 'email';
  backupCodesGenerated: boolean;
  backupCodesRemaining: number;
  loginNotifications: boolean;
  sessionTimeout: number;
  requirePasswordForChanges: boolean;
  securityAuditLogs: boolean;
}

interface DeviceSession {
  id: string;
  deviceType: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
}

interface AuditLog {
  id: string;
  eventType: string;
  description: string;
  ipAddress?: string;
  location?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

interface TwoFactorSetup {
  secret: string;
  otpauth: string;
  qrCode: string;
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    twoFactorMethod: 'totp',
    backupCodesGenerated: false,
    backupCodesRemaining: 0,
    loginNotifications: true,
    sessionTimeout: 30,
    requirePasswordForChanges: true,
    securityAuditLogs: true,
  });

  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Load security settings on component mount
  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const response = await fetch('/api/user/security-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.securitySettings);
        setSessions(data.activeSessions || []);
        setAuditLogs(data.recentAuditLogs || []);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const handleToggle = (key: keyof SecuritySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/security-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Security settings updated successfully!' });
        router.refresh();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update security settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update security settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSetup = async () => {
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/security-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup-2fa',
          currentPassword,
          method: 'totp',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTwoFactorSetup(data);
        setShowTwoFactorSetup(true);
        setMessage({ type: 'success', text: 'Two-factor authentication setup initiated' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to setup 2FA' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to setup 2FA' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerification = async () => {
    if (!verificationCode) {
      setMessage({ type: 'error', text: 'Please enter the verification code' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/security-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-2fa',
          code: verificationCode,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Two-factor authentication enabled successfully!' });
        setShowTwoFactorSetup(false);
        setTwoFactorSetup(null);
        setVerificationCode('');
        loadSecuritySettings();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Invalid verification code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to verify 2FA' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/security-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disable-2fa',
          currentPassword,
          method: 'totp',
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Two-factor authentication disabled successfully!' });
        loadSecuritySettings();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to disable 2FA' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disable 2FA' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/security-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-backup-codes',
          currentPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        setMessage({ type: 'success', text: 'Backup codes generated successfully!' });
        loadSecuritySettings();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to generate backup codes' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate backup codes' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/user/security-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'terminate-session',
          sessionId,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Session terminated successfully!' });
        loadSecuritySettings();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to terminate session' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to terminate session' });
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      const response = await fetch('/api/user/security-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'terminate-all-sessions',
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'All sessions terminated successfully!' });
        loadSecuritySettings();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to terminate sessions' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to terminate sessions' });
    }
  };



  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setMessage({ type: 'success', text: 'Backup codes copied to clipboard!' });
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sessionTimeoutOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 480, label: '8 hours' },
    { value: 1440, label: '24 hours' },
  ];

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {settings.twoFactorEnabled ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Enabled
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <Lock className="w-3 h-3 mr-1" />
                Disabled
              </span>
            )}
          </div>
        </div>

        {!settings.twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Two-factor authentication is not enabled
                  </p>
                  <p className="text-sm text-blue-700">
                    Enable 2FA to protect your account with an additional security layer
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTwoFactorSetup}
                disabled={isLoading || !currentPassword}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Setup Two-Factor Authentication
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Two-factor authentication is enabled
                  </p>
                  <p className="text-sm text-green-700">
                    Your account is protected with an additional security layer
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleGenerateBackupCodes}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Key className="w-4 h-4 mr-2" />
                Generate Backup Codes
              </button>

              <button
                type="button"
                onClick={handleDisableTwoFactor}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Disable 2FA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Setup Modal */}
      {showTwoFactorSetup && twoFactorSetup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Setup Two-Factor Authentication</h3>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img src={twoFactorSetup.qrCode} alt="QR Code" className="border rounded" />
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Scan this QR code with your authenticator app</p>
                  <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                    {twoFactorSetup.secret}
                  </p>
                </div>

                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleTwoFactorVerification}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enable'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowTwoFactorSetup(false);
                      setTwoFactorSetup(null);
                      setVerificationCode('');
                    }}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodes && backupCodes.length > 0 && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Codes</h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Save these backup codes in a secure location. You can use them to access your account if you lose your 2FA device.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="mb-1">
                      {index + 1}. {code}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={copyBackupCodes}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </button>
                  
                  <button
                    type="button"
                    onClick={downloadBackupCodes}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBackupCodes(false)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  I've Saved My Codes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Security Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Login notifications</p>
              <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('loginNotifications')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.loginNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.loginNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>


        </div>
      </div>

      {/* Session Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Session Management</h3>
          <button
            type="button"
            onClick={handleTerminateAllSessions}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Terminate all sessions
          </button>
        </div>

        <div>
          <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-2">
            Session timeout
          </label>
          <select
            id="sessionTimeout"
            name="sessionTimeout"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {sessionTimeoutOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {session.deviceName || session.deviceType}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session.location || 'Unknown location'} • {session.lastActive}
                  </p>
                  {session.ipAddress && (
                    <p className="text-xs text-gray-400">{session.ipAddress}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {session.isCurrent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Current
                  </span>
                )}
                {!session.isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleTerminateSession(session.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Terminate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Security */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Additional Security</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Require password for changes</p>
              <p className="text-sm text-gray-500">Ask for password when making account changes</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('requirePasswordForChanges')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.requirePasswordForChanges ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.requirePasswordForChanges ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>



          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Security audit logs</p>
              <p className="text-sm text-gray-500">Log security events for monitoring</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('securityAuditLogs')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.securityAuditLogs ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.securityAuditLogs ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Audit Logs */}
      {auditLogs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Security Events</h3>
          
          <div className="space-y-2">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                      {log.ipAddress && ` • ${log.ipAddress}`}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(log.riskLevel)}`}>
                  {log.riskLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : message.type === 'warning'
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
} 