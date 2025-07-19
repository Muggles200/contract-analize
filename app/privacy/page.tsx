import Link from "next/link";
import { 
  FileText, 
  Shield, 
  Lock, 
  Eye,
  Database,
  Users,
  Globe,
  Mail
} from "lucide-react";
import MobileMenu from "../components/MobileMenu";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">ContractAnalyze</span>
                </Link>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="/#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Features
                </Link>
                <Link href="/#pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Pricing
                </Link>
                <Link href="/#faq" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  FAQ
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  About
                </Link>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <MobileMenu />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: December 15, 2024
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <div className="flex items-start">
              <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Privacy Matters</h2>
                <p className="text-gray-600">
                  We are committed to protecting your privacy and ensuring the security of your data. This policy explains how we collect, use, and protect your information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">1.1 Personal Information</h3>
            <p className="text-gray-600 mb-4">
              We collect personal information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Name and contact information (email address, phone number)</li>
              <li>Company information and job title</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Account credentials and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">1.2 Contract Data</h3>
            <p className="text-gray-600 mb-4">
              When you use our contract analysis services, we may process:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Contract documents you upload for analysis</li>
              <li>Analysis results and insights generated by our AI</li>
              <li>Usage patterns and interaction data</li>
              <li>Metadata about your documents (file size, type, etc.)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">1.3 Technical Information</h3>
            <p className="text-gray-600 mb-6">
              We automatically collect certain technical information, including:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Usage analytics and performance data</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li>Provide and improve our contract analysis services</li>
              <li>Process payments and manage your subscription</li>
              <li>Send you important updates and notifications</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Data Sharing and Disclosure</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform (e.g., cloud hosting, payment processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Security</h2>
            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Measures</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <Lock className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <span>End-to-end encryption for all data in transit and at rest</span>
                </li>
                <li className="flex items-start">
                  <Lock className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <span>Multi-factor authentication for account access</span>
                </li>
                <li className="flex items-start">
                  <Lock className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <span>Regular security audits and penetration testing</span>
                </li>
                <li className="flex items-start">
                  <Lock className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <span>SOC 2 Type II compliance and ISO 27001 certification</span>
                </li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Your Rights and Choices</h2>
            <p className="text-gray-600 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. GDPR Compliance</h2>
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">EU Data Protection Rights</h3>
              <p className="text-gray-600 mb-4">
                If you are located in the European Union, you have additional rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Right to be informed about data processing</li>
                <li>• Right of access to your personal data</li>
                <li>• Right to rectification of inaccurate data</li>
                <li>• Right to erasure ("right to be forgotten")</li>
                <li>• Right to restrict processing</li>
                <li>• Right to data portability</li>
                <li>• Right to object to processing</li>
                <li>• Rights related to automated decision making</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Improve our services</li>
            </ul>
            <p className="text-gray-600 mb-8">
              Contract documents are retained for 30 days after analysis completion, unless you choose to store them longer. You can delete your data at any time through your account settings.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Cookies and Tracking</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Remember your preferences and settings</li>
              <li>Analyze website usage and performance</li>
              <li>Provide personalized content and features</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
            <p className="text-gray-600 mb-8">
              You can control cookie settings through your browser preferences. For more information, see our <Link href="/cookies" className="text-blue-600 hover:text-blue-700">Cookie Policy</Link>.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. International Data Transfers</h2>
            <p className="text-gray-600 mb-8">
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
              <li>Adequacy decisions where applicable</li>
              <li>Other appropriate safeguards as required by law</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Children's Privacy</h2>
            <p className="text-gray-600 mb-8">
              Our services are not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you believe we have collected information from a child under 16, please contact us immediately.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Changes to This Policy</h2>
            <p className="text-gray-600 mb-8">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li>Posting the updated policy on our website</li>
              <li>Sending you an email notification</li>
              <li>Displaying a notice in our application</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> privacy@contractanalize.com</p>
                <p><strong>Address:</strong> 123 Legal Tech Street, San Francisco, CA 94105</p>
                <p><strong>Data Protection Officer:</strong> dpo@contractanalize.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ContractAnalyze</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                AI-powered contract review tool helping businesses save time and reduce risk through intelligent analysis.
              </p>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-blue-400 font-medium">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="/gdpr" className="text-gray-400 hover:text-white transition-colors">GDPR</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 ContractAnalyze. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 