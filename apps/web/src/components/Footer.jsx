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
import { useWebsite } from "@/hooks/useTenantWebsite";

/* ================= DEFAULT FALLBACK PAGES ================= */
const DEFAULT_FOOTER_PAGES = {
  company: [
    { title: "About", slug: "about" },
    { title: "Contact", slug: "contact" },
  ],
  resources: [
    { title: "Help Center", slug: "help" },
    { title: "Security", slug: "security" },
    { title: "System Status", slug: "status" },
  ],
  legal: [
    { title: "Privacy Policy", slug: "privacy" },
    { title: "Terms", slug: "terms" },
    { title: "Refund Policy", slug: "refund-policy" },
    { title: "AML Policy", slug: "aml-policy" },
    { title: "KYC Policy", slug: "kyc-policy" },
  ],
};

export default function Footer() {
  const website = useWebsite();

  if (!website) return null;

  /* ================= SOCIAL ================= */
  const social = website.socialLinks || {};

  const socialItems = [
    { icon: Instagram, href: social.instagram, label: "Instagram" },
    { icon: Facebook, href: social.facebook, label: "Facebook" },
    { icon: Twitter, href: social.twitter, label: "Twitter" },
    { icon: Linkedin, href: social.linkedin, label: "LinkedIn" },
    { icon: Youtube, href: social.youtube, label: "YouTube" },
  ].filter((s) => s.href);

  /* ================= PAGE MERGE SYSTEM ================= */
  const tenantPages = website.footerPages || {};

  const companyPages = tenantPages.company || DEFAULT_FOOTER_PAGES.company;
  const resourcePages = tenantPages.resources || DEFAULT_FOOTER_PAGES.resources;
  const legalPages = tenantPages.legal || DEFAULT_FOOTER_PAGES.legal;

  return (
    <footer className="bg-card text-card-foreground border-t border-border">
      <div className="px-8">
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4 flex flex-col">
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
          <div className="space-y-4 flex flex-col justify-start items-start">
            <h3 className="font-semibold text-foreground pl-3">Company</h3>
            <div className="flex flex-col items-start text-sm">
              {companyPages.map((page) => (
                <Button
                  key={page.slug}
                  href={`/${page.slug}`}
                  variant="link"
                  className="p-0 h-auto text-muted-foreground"
                >
                  {page.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4 flex flex-col justify-start items-start">
            <h3 className="font-semibold text-foreground pl-3">Resources</h3>
            <div className="flex flex-col items-start text-sm">
              {resourcePages.map((page) => (
                <Button
                  key={page.slug}
                  href={`/${page.slug}`}
                  variant="link"
                  className="-p-3 h-auto text-muted-foreground"
                >
                  {page.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4 flex flex-col items-start lg:items-end">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="flex gap-3">
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

        {/* Bottom Legal */}
        <div className="py-8 border-t border-border text-center text-muted-foreground text-sm flex flex-col items-center gap-4">
          © 2026 {website.brandName}. All rights reserved.
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            {legalPages.map((page) => (
              <Button
                key={page.slug}
                href={`/${page.slug}`}
                variant="link"
                className="p-0 h-auto"
              >
                {page.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
