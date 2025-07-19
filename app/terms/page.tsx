import Link from "next/link";
import { 
  FileText, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Users,
  Globe,
  Mail
} from "lucide-react";
import MobileMenu from "../components/MobileMenu";

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: December 15, 2024
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Important Notice</h2>
                <p className="text-gray-600">
                  Please read these terms carefully before using our services. By using ContractAnalyze, you agree to be bound by these terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Service Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-8">
              By accessing or using ContractAnalyze ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              ContractAnalyze is an AI-powered contract analysis platform that provides:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li>Automated contract review and analysis</li>
              <li>Risk identification and assessment</li>
              <li>Key clause extraction and summarization</li>
              <li>Contract comparison and insights</li>
              <li>Team collaboration features</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">3.1 Account Creation</h3>
            <p className="text-gray-600 mb-4">
              To use our Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Keep your account credentials secure</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">3.2 Account Security</h3>
            <p className="text-gray-600 mb-8">
              You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Acceptable Use</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">4.1 Permitted Use</h3>
            <p className="text-gray-600 mb-4">
              You may use our Service for lawful business purposes only, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Analyzing contracts for your own business</li>
              <li>Reviewing contracts for clients (if you have proper authorization)</li>
              <li>Training and educational purposes</li>
              <li>Research and development activities</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">4.2 Prohibited Use</h3>
            <p className="text-gray-600 mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious software or content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for competitive analysis without permission</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. AI Analysis Disclaimer</h2>
            <div className="bg-red-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Legal Disclaimer</h3>
              <p className="text-gray-600 mb-4">
                <strong>Our AI analysis is for informational purposes only and does not constitute legal advice.</strong>
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <span>AI analysis results should not be relied upon as legal advice</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <span>Always consult with qualified legal professionals for legal decisions</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <span>AI accuracy is not guaranteed and may contain errors</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <span>We are not responsible for decisions made based on AI analysis</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">5.1 AI Limitations</h3>
            <p className="text-gray-600 mb-4">
              Our AI technology has certain limitations:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>May not identify all legal risks or issues</li>
              <li>Cannot replace human legal judgment</li>
              <li>May not be accurate for all contract types or jurisdictions</li>
              <li>Results may vary based on document quality and format</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">5.2 User Responsibility</h3>
            <p className="text-gray-600 mb-8">
              You acknowledge that you are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li>Verifying AI analysis results with qualified legal professionals</li>
              <li>Making final legal decisions based on your own judgment</li>
              <li>Ensuring compliance with applicable laws and regulations</li>
              <li>Maintaining appropriate legal counsel for your business needs</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Subscription and Payment</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">6.1 Subscription Plans</h3>
            <p className="text-gray-600 mb-4">
              We offer various subscription plans with different features and usage limits. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Pay all fees associated with your chosen plan</li>
              <li>Provide accurate billing information</li>
              <li>Authorize recurring payments for subscription plans</li>
              <li>Comply with usage limits for your plan</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">6.2 Payment Terms</h3>
            <p className="text-gray-600 mb-4">
              Payment terms include:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Fees are billed in advance on a monthly or annual basis</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>We may change our pricing with 30 days' notice</li>
              <li>Late payments may result in service suspension</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">6.3 Cancellation</h3>
            <p className="text-gray-600 mb-8">
              You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. No refunds will be provided for partial months.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Intellectual Property</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">7.1 Our Rights</h3>
            <p className="text-gray-600 mb-4">
              ContractAnalyze and its content are protected by intellectual property laws. We retain all rights to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Our software, technology, and platform</li>
              <li>Our brand, trademarks, and logos</li>
              <li>Our documentation and training materials</li>
              <li>Our AI models and algorithms</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">7.2 Your Rights</h3>
            <p className="text-gray-600 mb-4">
              You retain ownership of:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Your contract documents and data</li>
              <li>Your analysis results and insights</li>
              <li>Your custom configurations and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">7.3 License</h3>
            <p className="text-gray-600 mb-8">
              We grant you a limited, non-exclusive, non-transferable license to use our Service in accordance with these Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Data and Privacy</h2>
            <p className="text-gray-600 mb-4">
              Your privacy is important to us. Our data practices are governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <p className="text-gray-600 mb-8">
              By using our Service, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Service Availability</h2>
            <p className="text-gray-600 mb-4">
              We strive to provide reliable service but cannot guarantee:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Uninterrupted or error-free operation</li>
              <li>Specific response times or processing speeds</li>
              <li>Compatibility with all devices or browsers</li>
              <li>Availability during maintenance periods</li>
            </ul>
            <p className="text-gray-600 mb-8">
              We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Limitation of Liability</h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liability Limitations</h3>
              <p className="text-gray-600 mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• We are not liable for indirect, incidental, or consequential damages</li>
                <li>• Our total liability is limited to the amount you paid us in the 12 months preceding the claim</li>
                <li>• We are not liable for damages resulting from your use of AI analysis</li>
                <li>• We are not liable for data loss or security breaches beyond our control</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Indemnification</h2>
            <p className="text-gray-600 mb-8">
              You agree to indemnify and hold harmless ContractAnalyze from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Termination</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">12.1 Termination by You</h3>
            <p className="text-gray-600 mb-4">
              You may terminate your account at any time by:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Canceling your subscription</li>
              <li>Deleting your account through account settings</li>
              <li>Contacting our support team</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">12.2 Termination by Us</h3>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account if:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>You violate these Terms</li>
              <li>You engage in fraudulent or illegal activities</li>
              <li>You fail to pay applicable fees</li>
              <li>We discontinue the Service</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">12.3 Effect of Termination</h3>
            <p className="text-gray-600 mb-8">
              Upon termination, your access to the Service will cease, and we may delete your data in accordance with our data retention policies.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">13. Governing Law</h2>
            <p className="text-gray-600 mb-8">
              These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles. Any disputes will be resolved in the courts of San Francisco County, California.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">14. Changes to Terms</h2>
            <p className="text-gray-600 mb-8">
              We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and sending you an email notification. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">15. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> legal@contractanalize.com</p>
                <p><strong>Address:</strong> 123 Legal Tech Street, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
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
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-blue-400 font-medium">Terms of Service</Link></li>
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