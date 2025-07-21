import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { 
  Check, 
  X, 
  Zap, 
  Users, 
  Shield, 
  Star,
  ArrowRight,
  Crown,
  AlertTriangle,
  Info,
  FileText,
  Download,
  Globe,
  Lock,
  Clock,
  TrendingUp
} from 'lucide-react';
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  limits: {
    contracts: number;
    users: number;
    storage: string;
  };
  popular?: boolean;
  recommended?: boolean;
  cta: string;
  ctaLink: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Perfect for trying out our contract analysis features',
    features: [
      '2 contract analyses per month',
      'Basic AI analysis',
      'Standard support',
      'PDF export',
      'Basic clause extraction',
      'Risk identification'
    ],
    limits: {
      contracts: 2,
      users: 1,
      storage: '100MB'
    },
    cta: 'Get Started Free',
    ctaLink: '/auth/register'
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    interval: 'month',
    description: 'Ideal for freelancers and small businesses',
    features: [
      '10 contract analyses per month',
      'Advanced AI analysis',
      'Priority support',
      'PDF & Word export',
      'Email notifications',
      'Basic analytics',
      'Custom metadata',
      'Bulk upload support'
    ],
    limits: {
      contracts: 10,
      users: 1,
      storage: '1GB'
    },
    cta: 'Start Free Trial',
    ctaLink: '/auth/register?plan=basic'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    interval: 'month',
    description: 'Best for growing teams and agencies',
    features: [
      '50 contract analyses per month',
      'Advanced AI analysis',
      'Priority support',
      'All export formats',
      'Advanced analytics',
      'Team collaboration',
      'Custom branding',
      'API access',
      'Advanced risk assessment',
      'Custom playbooks',
      'Integration support'
    ],
    limits: {
      contracts: 50,
      users: 5,
      storage: '10GB'
    },
    popular: true,
    cta: 'Start Free Trial',
    ctaLink: '/auth/register?plan=pro'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    description: 'For large organizations with unlimited needs',
    features: [
      'Unlimited contract analyses',
      'Advanced AI analysis',
      '24/7 priority support',
      'All export formats',
      'Advanced analytics',
      'Unlimited team members',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment',
      'Custom AI training',
      'White-label solution'
    ],
    limits: {
      contracts: -1, // Unlimited
      users: -1, // Unlimited
      storage: '100GB'
    },
    recommended: true,
    cta: 'Contact Sales',
    ctaLink: '/contact'
  }
];

export default async function PricingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your contract analysis needs. Start free and upgrade as you grow.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    No setup fees • Cancel anytime • 14-day free trial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 ${
                plan.popular 
                  ? 'border-blue-500 ring-4 ring-blue-500/20' 
                  : plan.recommended
                  ? 'border-purple-500 ring-4 ring-purple-500/20'
                  : 'border-gray-200'
              } p-8`}
            >
              {/* Popular/Recommended Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Crown className="w-4 h-4 mr-1" />
                    Recommended
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600">/{plan.interval}</span>
                  )}
                </div>

                {/* Limits */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>
                      {plan.limits.contracts === -1 ? 'Unlimited' : plan.limits.contracts} contract analyses
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {plan.limits.users === -1 ? 'Unlimited' : plan.limits.users} team member{plan.limits.users !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>{plan.limits.storage} storage</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                {userId ? (
                  <Link
                    href={plan.id === 'enterprise' ? '/contact' : `/dashboard/billing?plan=${plan.id}`}
                    className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : plan.recommended
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href={plan.ctaLink}
                    className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : plan.recommended
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compare All Features
            </h2>
            <p className="text-lg text-gray-600">
              See what's included in each plan to make the best choice for your needs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Basic</th>
                  <th className="text-center py-4 px-6 font-semibold text-blue-600">Pro</th>
                  <th className="text-center py-4 px-6 font-semibold text-purple-600">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Contract Analyses</td>
                  <td className="py-4 px-6 text-center text-gray-600">2/month</td>
                  <td className="py-4 px-6 text-center text-gray-600">10/month</td>
                  <td className="py-4 px-6 text-center text-gray-600">50/month</td>
                  <td className="py-4 px-6 text-center text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Team Members</td>
                  <td className="py-4 px-6 text-center text-gray-600">1</td>
                  <td className="py-4 px-6 text-center text-gray-600">1</td>
                  <td className="py-4 px-6 text-center text-gray-600">5</td>
                  <td className="py-4 px-6 text-center text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Storage</td>
                  <td className="py-4 px-6 text-center text-gray-600">100MB</td>
                  <td className="py-4 px-6 text-center text-gray-600">1GB</td>
                  <td className="py-4 px-6 text-center text-gray-600">10GB</td>
                  <td className="py-4 px-6 text-center text-gray-600">100GB</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">AI Analysis</td>
                  <td className="py-4 px-6 text-center text-gray-600">Basic</td>
                  <td className="py-4 px-6 text-center text-gray-600">Advanced</td>
                  <td className="py-4 px-6 text-center text-gray-600">Advanced</td>
                  <td className="py-4 px-6 text-center text-gray-600">Advanced</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Export Formats</td>
                  <td className="py-4 px-6 text-center text-gray-600">PDF</td>
                  <td className="py-4 px-6 text-center text-gray-600">PDF, Word</td>
                  <td className="py-4 px-6 text-center text-gray-600">All Formats</td>
                  <td className="py-4 px-6 text-center text-gray-600">All Formats</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Support</td>
                  <td className="py-4 px-6 text-center text-gray-600">Standard</td>
                  <td className="py-4 px-6 text-center text-gray-600">Priority</td>
                  <td className="py-4 px-6 text-center text-gray-600">Priority</td>
                  <td className="py-4 px-6 text-center text-gray-600">24/7 Priority</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">API Access</td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Custom Branding</td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Dedicated Manager</td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I change my plan anytime?
                </h3>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-gray-600">
                  Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens if I exceed my plan limits?
                </h3>
                <p className="text-gray-600">
                  We'll notify you when you're approaching your limits. You can upgrade your plan or wait until your next billing cycle.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-gray-600">
                  Absolutely! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-600">
                  We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is my data secure?
                </h3>
                <p className="text-gray-600">
                  Yes! We use enterprise-grade security and are GDPR compliant. Your contracts and data are encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust our AI-powered contract analysis platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-lg text-white hover:bg-blue-700 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 