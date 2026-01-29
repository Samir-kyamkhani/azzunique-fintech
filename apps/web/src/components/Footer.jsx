"use client";

import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  Globe,
  Instagram,
  Youtube,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useSelector } from "react-redux";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const website = useSelector((state) => state.tenantWebsite?.currentWebsite);

  if (!website) return null;

  const social = website.socialLinks || {};

  const socialItems = [
    { icon: Instagram, href: social.instagram, label: "Instagram" },
    { icon: Facebook, href: social.facebook, label: "Facebook" },
    { icon: Twitter, href: social.twitter, label: "Twitter" },
    { icon: Linkedin, href: social.linkedin, label: "LinkedIn" },
    { icon: Youtube, href: social.youtube, label: "YouTube" },
  ].filter((s) => s.href);

  const linkSections = [
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Security", href: "/security" },
        { label: "API Docs", href: "/api-docs" },
        { label: "Status", href: "/status" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Refund Policy", href: "/refund-policy" },
        { label: "AML Policy", href: "/aml-policy" },
        { label: "KYC Policy", href: "/kyc-policy" },
      ],
    },
  ];

  return (
    <footer className="bg-card text-card-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              {website.brandName}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {website.tagLine}
            </p>

            <div className="space-y-2 text-sm">
              {website.supportPhone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {website.supportPhone}
                </div>
              )}
              {website.supportEmail && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {website.supportEmail}
                </div>
              )}
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Button
                href="/about"
                variant="link"
                className="p-0 h-auto text-muted-foreground"
              >
                About
              </Button>
              <Button
                href="/pricing"
                variant="link"
                className="p-0 h-auto text-muted-foreground"
              >
                Pricing
              </Button>
              <Button
                href="/contact"
                variant="link"
                className="p-0 h-auto text-muted-foreground"
              >
                Contact
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Button
                href="/help"
                variant="link"
                className="p-0 h-auto text-muted-foreground"
              >
                Help Center
              </Button>
              <Button
                href="/security"
                variant="link"
                className="p-0 h-auto text-muted-foreground"
              >
                Security
              </Button>
              <Button
                href="/api-docs"
                variant="link"
                className="p-0 h-auto text-muted-foreground"
              >
                API Documentation
              </Button>
              <Button
                href="/status"
                variant="link"
                className="p-0 h-auto text-muted-foreground"
              >
                System Status
              </Button>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4 lg:text-right">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="flex gap-3 lg:justify-end">
              {socialItems.map((s) => (
                <Button
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  variant="ghost"
                  size="icon"
                  className="bg-muted hover:bg-accent"
                  icon={s.icon}
                />
              ))}
            </div>

            {website.brandName?.toLowerCase().includes("azzunique") && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm lg:justify-end">
                <Globe className="h-4 w-4" />
                Multi-tenant SaaS Platform
              </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-border text-center text-muted-foreground text-sm">
          © {currentYear} {website.brandName}. All rights reserved.
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
            <Button href="/privacy" variant="link" className="p-0 h-auto">
              Privacy Policy
            </Button>
            <Button href="/terms" variant="link" className="p-0 h-auto">
              Terms
            </Button>
            <Button href="/refund-policy" variant="link" className="p-0 h-auto">
              Refund
            </Button>
            <Button href="/aml-policy" variant="link" className="p-0 h-auto">
              AML
            </Button>
            <Button href="/kyc-policy" variant="link" className="p-0 h-auto">
              KYC
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
