"use client";

import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  Globe,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description:
        "Military-grade encryption and secure authentication for your business data.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description:
        "Optimized performance with real-time updates and instant access.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Collaboration",
      description:
        "Seamless collaboration tools for distributed teams and departments.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Access",
      description:
        "Access your dashboard from anywhere with 99.9% uptime guarantee.",
    },
  ];

  const benefits = [
    "256-bit SSL Encryption",
    "GDPR & CCPA Compliant",
    "24/7 Customer Support",
    "30-day Money Back Guarantee",
    "SOC 2 Type II Certified",
    "Automated Backups",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-theme text-primary-foreground">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 rounded-full mb-6">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Trusted by 5000+ businesses
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Secure Enterprise
              <span className="block text-gradient-primary bg-clip-text text-transparent">
                Platform
              </span>
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              All-in-one solution for business authentication, employee
              management, and secure data handling with enterprise-grade
              security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-foreground text-primary font-semibold rounded-border hover:bg-primary-foreground/90 transition-colors"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-primary-foreground/30 hover:bg-primary-foreground/10 rounded-border transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need for secure business operations
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools and features designed for modern enterprises
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg-border p-6 hover:shadow-lg-border transition-all duration-300"
              >
                <div className="h-12 w-12 bg-gradient-theme rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose SecurePortal
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of satisfied businesses worldwide
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-lg text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-dark text-card-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to secure your business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your 14-day free trial. No credit card required.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-theme text-primary-foreground font-semibold rounded-border hover:opacity-90 transition-all"
            >
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
