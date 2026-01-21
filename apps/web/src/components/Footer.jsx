"use client";

import {
  Shield,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "API", href: "/api" },
      { name: "Documentation", href: "/docs" },
    ],
    Company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    Support: [
      { name: "Help Center", href: "/help" },
      { name: "Security", href: "/security" },
      { name: "Status", href: "/status" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://facebook.com",
      label: "Facebook",
    },
    {
      icon: Twitter,
      href: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: Linkedin,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
    {
      icon: Mail,
      href: "mailto:contact@secureportal.com",
      label: "Email",
    },
  ];

  return (
    <footer className="bg-gradient-dark text-card-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary-foreground/10 rounded-border mr-3">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-primary-foreground font-bold text-2xl">
                  SecurePortal
                </span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Secure enterprise platform for businesses and employees. Trusted
                by thousands of organizations worldwide for secure
                authentication and management.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-3" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-3" />
                  <span>support@secureportal.com</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-3" />
                  <span>123 Business St, San Francisco, CA 94107</span>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-4 text-primary-foreground">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Button
                        href={link.href}
                        variant="link"
                        className="text-muted-foreground hover:text-primary-foreground p-0 h-auto"
                      >
                        {link.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Links & Language */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  href={social.href}
                  variant="ghost"
                  size="icon"
                  className="bg-card hover:bg-accent"
                  aria-label={social.label}
                  icon={social.icon}
                />
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <select className="bg-card text-card-foreground border-border rounded-border px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none">
                  <option>English</option>
                  <option>Español</option>
                  <option>Français</option>
                  <option>Deutsch</option>
                </select>
              </div>
              <Button href="/register" className="hover:opacity-90">
                Get Started
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm mb-4 md:mb-0">
              © {currentYear} SecurePortal. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Button
                href="/terms"
                variant="link"
                className="text-muted-foreground hover:text-primary-foreground p-0 h-auto"
              >
                Terms of Service
              </Button>
              <Button
                href="/privacy"
                variant="link"
                className="text-muted-foreground hover:text-primary-foreground p-0 h-auto"
              >
                Privacy Policy
              </Button>
              <Button
                href="/cookies"
                variant="link"
                className="text-muted-foreground hover:text-primary-foreground p-0 h-auto"
              >
                Cookie Policy
              </Button>
              <Button
                href="/sitemap"
                variant="link"
                className="text-muted-foreground hover:text-primary-foreground p-0 h-auto"
              >
                Sitemap
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-muted-foreground text-sm">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <span>SOC 2 Type II</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
