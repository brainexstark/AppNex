import Navbar from "@/components/Navbar";
import Link from "next/link";
import { CheckCircle, Zap, Rocket, Building2, ArrowRight, Star } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for indie developers and side projects.",
    icon: Zap,
    color: "from-gray-500 to-gray-600",
    border: "border-white/10",
    badge: null,
    features: [
      "Submit up to 5 apps",
      "Public app listings",
      "Auto metadata extraction",
      "PWA, APK & Web support",
      "Basic install button",
      "Community support",
    ],
    cta: "Get started free",
    ctaHref: "/signup",
    ctaStyle: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    desc: "For developers who ship regularly and need more control.",
    icon: Rocket,
    color: "from-blue-500 to-purple-600",
    border: "border-blue-500/40",
    badge: "Most Popular",
    features: [
      "Unlimited app submissions",
      "Custom app page branding",
      "Analytics & install tracking",
      "Priority metadata extraction",
      "Custom install button text",
      "Remove AppNex branding",
      "Email support",
    ],
    cta: "Start Pro — $9/mo",
    ctaHref: "/signup",
    ctaStyle: "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30",
  },
  {
    name: "Team",
    price: "$29",
    period: "per month",
    desc: "For studios and teams managing multiple products.",
    icon: Building2,
    color: "from-purple-500 to-pink-600",
    border: "border-purple-500/30",
    badge: null,
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared app dashboard",
      "Role-based access control",
      "API access",
      "Webhook integrations",
      "Dedicated Slack support",
      "SLA guarantee",
    ],
    cta: "Start Team plan",
    ctaHref: "/signup",
    ctaStyle: "border border-purple-500/40 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20",
  },
];

const FAQS = [
  {
    q: "Can I upgrade or downgrade at any time?",
    a: "Yes. You can change your plan at any time. Upgrades take effect immediately; downgrades apply at the end of your billing cycle.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. Enterprise customers can pay by invoice.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Yes — Pro comes with a 14-day free trial. No credit card required to start.",
  },
  {
    q: "What happens to my apps if I downgrade?",
    a: "Your apps stay live. If you exceed the Free tier limit (5 apps), older apps are archived but not deleted.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden hero-bg py-20 px-4 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-a absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
            <Star className="h-3 w-3 fill-blue-400 text-blue-400" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Plans for every <span className="gradient-text">developer</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Start free. Scale as you grow. No hidden fees, no lock-in.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border ${plan.border} bg-[#1A1A2E] p-8 transition-all hover:scale-[1.02] hover:shadow-2xl`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                <p className="text-xs text-gray-500 mb-4">{plan.desc}</p>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500 ml-1">/{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${plan.ctaStyle}`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Enterprise */}
        <div className="mt-8 rounded-3xl border border-white/8 bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Enterprise</h3>
            <p className="text-sm text-gray-400 max-w-md">
              Custom contracts, SSO, dedicated infrastructure, and white-label options for large organisations.
            </p>
          </div>
          <Link
            href="/support"
            className="flex-shrink-0 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
          >
            Contact sales <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-white/8 bg-[#1A1A2E] p-6">
              <h3 className="text-sm font-semibold text-white mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
