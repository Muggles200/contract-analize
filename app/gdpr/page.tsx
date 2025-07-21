import Link from "next/link";
import { 
  FileText, 
  Shield, 
  CheckCircle,
  Eye,
  Database,
  Users,
  Globe,
  Mail,
  Lock,
  Download,
  Trash2
} from "lucide-react";
import MobileMenu from "../components/MobileMenu";
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default function GDPRPage() {
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
              <SignInButton><button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Sign In</button></SignInButton>
              <SignUpButton><button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Get Started</button></SignUpButton>
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
              GDPR Compliance
            </h1>
            <p className="text-xl text-gray-600">
              Your data protection rights under the General Data Protection Regulation
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <div className="flex items-start">
              <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">EU Data Protection</h2>
                <p className="text-gray-600">
                  We are committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR) for all EU residents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GDPR Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. What is GDPR?</h2>
            <p className="text-gray-600 mb-4">
              The General Data Protection Regulation (GDPR) is a comprehensive data protection law that came into effect on May 25, 2018. It applies to all organizations operating within the EU and those that offer goods or services to individuals in the EU, regardless of where the organization is based.
            </p>
            <p className="text-gray-600 mb-8">
              GDPR gives EU residents greater control over their personal data and requires organizations to be more transparent about how they collect, use, and protect personal information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Your GDPR Rights</h2>
            <p className="text-gray-600 mb-6">
              As an EU resident, you have the following rights regarding your personal data:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-start mb-4">
                  <Eye className="w-6 h-6 text-green-600 mr-3 mt-1" />
                  <h3 className="text-lg font-semibold text-gray-900">Right to be Informed</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  You have the right to be informed about the collection and use of your personal data. We provide this information in our Privacy Policy and through clear notices when we collect your data.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-start mb-4">
                  <Database className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <h3 className="text-lg font-semibold text-gray-900">Right of Access</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  You have the right to access your personal data and receive information about how it is processed. You can request a copy of your data through your account settings or by contacting us.
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-start mb-4">
                  <CheckCircle className="w-6 h-6 text-purple-600 mr-3 mt-1" />
                  <h3 className="text-lg font-semibold text-gray-900">Right to Rectification</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  You have the right to have inaccurate personal data corrected and incomplete data completed. You can update your information through your account settings or by contacting us.
                </p>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-start mb-4">
                  <Trash2 className="w-6 h-6 text-red-600 mr-3 mt-1" />
                  <h3 className="text-lg font-semibold text-gray-900">Right to Erasure</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Also known as the "right to be forgotten," you have the right to have your personal data deleted in certain circumstances. You can request deletion through your account settings.
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="flex items-start mb-4">
                  <Lock className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
                  <h3 className="text-lg font-semibold text-gray-900">Right to Restrict Processing</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  You have the right to restrict the processing of your personal data in certain circumstances, such as when you contest the accuracy of the data or object to processing.
                </p>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg">
                <div className="flex items-start mb-4">
                  <Download className="w-6 h-6 text-indigo-600 mr-3 mt-1" />
                  <h3 className="text-lg font-semibold text-gray-900">Right to Data Portability</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  You have the right to receive your personal data in a structured, commonly used, machine-readable format and to transmit that data to another controller.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How to Exercise Your Rights</h2>
            <p className="text-gray-600 mb-4">
              You can exercise your GDPR rights in several ways:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li><strong>Account Settings:</strong> Many rights can be exercised directly through your account settings</li>
              <li><strong>Email Request:</strong> Send an email to privacy@contractanalize.com</li>
              <li><strong>Data Protection Officer:</strong> Contact our DPO at dpo@contractanalize.com</li>
              <li><strong>Contact Form:</strong> Use our contact form on the website</li>
            </ul>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
              <p className="text-gray-600 mb-4">
                We will respond to your request within 30 days of receipt. If we need more time to process your request, we will notify you within 30 days and explain why the extension is necessary.
              </p>
              <p className="text-gray-600">
                In most cases, we will provide the requested information free of charge. However, we may charge a reasonable fee if your request is manifestly unfounded or excessive.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Our GDPR Compliance Measures</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">4.1 Data Protection by Design</h3>
            <p className="text-gray-600 mb-4">
              We implement data protection principles from the start of any new project or system:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Privacy impact assessments for new features</li>
              <li>Data minimization in all data collection</li>
              <li>Secure by design architecture</li>
              <li>Regular privacy training for our team</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">4.2 Legal Basis for Processing</h3>
            <p className="text-gray-600 mb-4">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li><strong>Consent:</strong> When you explicitly agree to data processing</li>
              <li><strong>Contract:</strong> When processing is necessary to fulfill our service agreement</li>
              <li><strong>Legitimate Interest:</strong> When processing is necessary for our legitimate business interests</li>
              <li><strong>Legal Obligation:</strong> When processing is required by law</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">4.3 Data Security</h3>
            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Security Measures</h4>
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
                  <span>Employee training on data protection</span>
                </li>
                <li className="flex items-start">
                  <Lock className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <span>Incident response procedures</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">4.4 Data Retention</h3>
            <p className="text-gray-600 mb-4">
              We retain your personal data only for as long as necessary to:
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

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. International Data Transfers</h2>
            <p className="text-gray-600 mb-4">
              Your data may be transferred to and processed in countries outside the European Economic Area (EEA). We ensure appropriate safeguards are in place for these transfers:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li><strong>Standard Contractual Clauses (SCCs):</strong> We use EU-approved SCCs for data transfers to non-adequate countries</li>
              <li><strong>Adequacy Decisions:</strong> We rely on adequacy decisions for transfers to countries with equivalent data protection standards</li>
              <li><strong>Certification Schemes:</strong> We use certified mechanisms where available</li>
            </ul>
            <p className="text-gray-600 mb-8">
              You can request information about the specific safeguards we have in place for international data transfers.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Data Breach Notification</h2>
            <p className="text-gray-600 mb-4">
              In the event of a personal data breach that poses a risk to your rights and freedoms, we will:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Notify the relevant supervisory authority within 72 hours</li>
              <li>Notify affected individuals without undue delay</li>
              <li>Document all breaches and our response</li>
              <li>Take immediate steps to contain and remediate the breach</li>
            </ul>
            <p className="text-gray-600 mb-8">
              We have established procedures to detect, report, and investigate personal data breaches.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Your Right to Complain</h2>
            <p className="text-gray-600 mb-4">
              If you believe that we have not handled your personal data in accordance with GDPR, you have the right to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Lodge a complaint with your local data protection authority</li>
              <li>Seek judicial remedy</li>
              <li>Request compensation for damages</li>
            </ul>
            <p className="text-gray-600 mb-8">
              We encourage you to contact us first to resolve any concerns. You can find contact information for EU data protection authorities on the European Data Protection Board website.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For any questions about our GDPR compliance or to exercise your rights, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <div className="space-y-2 text-gray-600">
                <p><strong>General Privacy Inquiries:</strong> privacy@contractanalize.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@contractanalize.com</p>
                <p><strong>Address:</strong> 123 Legal Tech Street, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Updates to This Policy</h2>
            <p className="text-gray-600 mb-8">
              We may update this GDPR compliance information from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated information on our website.
            </p>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link> - Detailed information about our data practices</li>
                <li>• <Link href="/cookies" className="text-blue-600 hover:text-blue-700">Cookie Policy</Link> - Information about our use of cookies</li>
                <li>• <Link href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link> - Our terms and conditions</li>
                <li>• <a href="https://edpb.europa.eu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">European Data Protection Board</a> - Official GDPR information</li>
              </ul>
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
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="/gdpr" className="text-blue-400 font-medium">GDPR</Link></li>
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