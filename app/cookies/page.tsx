import Link from "next/link";
import { 
  FileText, 
  Shield, 
  Settings,
  Eye,
  Database,
  Users,
  Globe,  
  Mail
} from "lucide-react";
import MobileMenu from "../components/MobileMenu";

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: December 15, 2024
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <div className="flex items-start">
              <Settings className="w-6 h-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Cookie Transparency</h2>
                <p className="text-gray-600">
                  We use cookies to improve your experience on our website. This policy explains what cookies are, how we use them, and how you can control them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Policy Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. What Are Cookies?</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember information about your visit, such as your preferred language and other settings, which can make your next visit easier and more useful.
            </p>
            <p className="text-gray-600 mb-8">
              Cookies are widely used to make websites work more efficiently and to provide information to website owners.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Cookies</h2>
            <p className="text-gray-600 mb-4">
              ContractAnalyze uses cookies for several purposes:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics Cookies:</strong> Help us improve our website and services</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">3.1 Essential Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Authentication cookies (login sessions)</li>
                <li>• Security cookies (CSRF protection)</li>
                <li>• Load balancing cookies</li>
                <li>• User interface customization cookies</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">3.2 Performance Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google Analytics cookies</li>
                <li>• Page load time tracking</li>
                <li>• Error tracking cookies</li>
                <li>• User behavior analytics</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">3.3 Functional Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
            </p>
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Language preference cookies</li>
                <li>• Theme preference cookies</li>
                <li>• Form auto-fill cookies</li>
                <li>• User preference cookies</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">3.4 Marketing Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.
            </p>
            <div className="bg-orange-50 p-4 rounded-lg mb-8">
              <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google Ads cookies</li>
                <li>• Facebook Pixel cookies</li>
                <li>• LinkedIn Insight cookies</li>
                <li>• Retargeting cookies</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Third-Party Cookies</h2>
            <p className="text-gray-600 mb-4">
              We use third-party services that may set cookies on your device:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li><strong>Google Analytics:</strong> Website analytics and performance tracking</li>
              <li><strong>Stripe:</strong> Payment processing and security</li>
              <li><strong>Vercel:</strong> Website hosting and performance</li>
              <li><strong>Resend:</strong> Email delivery and tracking</li>
              <li><strong>OpenAI:</strong> AI analysis services</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Cookie Duration</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">5.1 Session Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are temporary and are deleted when you close your browser. They are used to maintain your session while you browse our website.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">5.2 Persistent Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies remain on your device for a set period or until you delete them. They are used to remember your preferences and settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">5.3 Cookie Lifespan</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <h4 className="font-semibold text-gray-900 mb-2">Typical Cookie Lifespans:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Session cookies: Until browser is closed</li>
                <li>• Authentication cookies: 30 days</li>
                <li>• Analytics cookies: 2 years</li>
                <li>• Marketing cookies: 1 year</li>
                <li>• Preference cookies: 1 year</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Managing Your Cookie Preferences</h2>
            <p className="text-gray-600 mb-4">
              You have several options for managing cookies:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">6.1 Browser Settings</h3>
            <p className="text-gray-600 mb-4">
              Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">How to manage cookies in your browser:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li>• <strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li>• <strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li>• <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">6.2 Cookie Consent</h3>
            <p className="text-gray-600 mb-4">
              When you first visit our website, you'll see a cookie consent banner that allows you to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>Accept all cookies</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your cookie preferences</li>
              <li>Learn more about our cookie policy</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">6.3 Cookie Preferences Center</h3>
            <p className="text-gray-600 mb-8">
              You can update your cookie preferences at any time by visiting our Cookie Preferences Center or contacting us directly.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Impact of Disabling Cookies</h2>
            <p className="text-gray-600 mb-4">
              If you choose to disable cookies, some features of our website may not function properly:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-600">
              <li>You may need to re-enter information each time you visit</li>
              <li>Some features may not work as expected</li>
              <li>Your preferences may not be saved</li>
              <li>Security features may be limited</li>
              <li>Analytics and performance monitoring may be affected</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. GDPR and Cookie Consent</h2>
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">EU Cookie Requirements</h3>
              <p className="text-gray-600 mb-4">
                For users in the European Union, we comply with GDPR requirements for cookie consent:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• We obtain explicit consent before setting non-essential cookies</li>
                <li>• You can withdraw consent at any time</li>
                <li>• We provide clear information about cookie usage</li>
                <li>• We offer granular control over different cookie types</li>
                <li>• We maintain records of consent</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Updates to This Policy</h2>
            <p className="text-gray-600 mb-8">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
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
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-blue-400 font-medium">Cookie Policy</Link></li>
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