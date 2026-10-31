import Link from "next/link";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";

const footerLinks = [
  { href: "/programs", label: "Programs" },
  { href: "/news", label: "News" },
  { href: "/newsletters", label: "Newsletters" },
  { href: "/events", label: "Events" },
  { href: "/community", label: "Community" },
  { href: "/donate", label: "Donate" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Get Involved" },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary-dark to-primary text-white py-6 px-4">
      <div className="max-w-7xl mx-auto mb-4">
        <p className="text-sm font-semibold mb-2 text-center sm:text-left">Subscribe to our newsletter</p>
        <NewsletterSubscribeForm />
      </div>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
        <div className="text-center sm:text-left">
          <p className="font-semibold">Purple Fireflies</p>
          <p className="text-white/70 text-xs">Serving our community</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a href="mailto:info@purplefireflies.org" className="text-sm text-white/80 hover:text-white transition-colors">
            info@purplefireflies.org
          </a>
          <a href="tel:+17408194003" className="text-sm text-white/80 hover:text-white transition-colors">
            (740) 819-4003
          </a>
        </div>
        <p className="text-white/50 text-xs">© 2026 Purple Fireflies</p>
      </div>
    </footer>
  );
}
