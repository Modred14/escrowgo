"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
/**
 * Footer — EscrowGo
 * Drop-in section for a landing page. Requires Tailwind + lucide-react.
 *
 * <Footer /> — no props required.
 */

const LINK_GROUPS = [
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Career", href: "#career" },
      { label: "Blog", href: "#blog" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Support", href: "#support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "CAC Reg", href: "#cac-reg" },
    ],
  },
];

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-6.9l-5.4-6.6L4.7 22H1.6l8.1-9.3L1 2h7.1l4.9 6.1L18.9 2Zm-1.2 18h1.9L7.4 4h-2l12.3 16Z" />
    </svg>
  );
}

const SOCIALS = [
  { icon: XIcon, href: "#", label: "X (Twitter)" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaLinkedin, href: "#", label: "LinkedIn" },
];

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}

export default function Footer() {
  const [ref, inView] = useInView({ threshold: 0.15 });
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={ref}
      className="relative w-full overflow-hidden bg-[#1B1610] px-4 pb-8 pt-16 sm:px-8 sm:pt-20"
    >
      <style>{`
        @keyframes footerRise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .footer-rise {
          opacity: 0;
        }
        .footer-rise.in-view {
          animation: footerRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .footer-link {
          position: relative;
          display: inline-block;
        }
        .footer-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          height: 1px;
          width: 0%;
          background: linear-gradient(90deg, #FBBF24, #F97316);
          transition: width 0.3s ease;
        }
        .footer-link:hover::after {
          width: 100%;
        }
      `}</style>

      {/* Ambient glow, clipped in its own layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-500/[0.06] blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-orange-500/[0.06] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 sm:gap-0 sm:grid-cols-2">
          {/* Brand block */}
          <div
            className={`footer-rise ${inView ? "in-view" : ""}`}
          >
            <a href="#top" className="inline-flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="EscrowGo Logo"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-lg font-semibold tracking-tight text-white">
                EscrowGo
              </span>
            </a>
            <p className="mt-3 max-w-xs text-sm font-medium leading-relaxed text-white/55">
              Protected. Verified. Paid.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/50 hover:text-amber-400"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-row flex-wrap w-full justify-between">
            {/* Link groups */}
            {LINK_GROUPS.map((group, gi) => (
              <div
                key={group.title}
                style={{ animationDelay: `${(gi + 1) * 100}ms` }}
                className={`footer-rise ${inView ? "in-view" : ""}`}
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {group.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="footer-link text-sm text-white/65 transition-colors duration-300 hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className={`footer-rise ${inView ? "in-view" : ""} mt-14 h-px w-full bg-white/10`}
          style={{ animationDelay: "450ms" }}
        />

        {/* Bottom bar */}
        <div
          className={`footer-rise ${inView ? "in-view" : ""} mt-8 flex flex-col-reverse items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left`}
          style={{ animationDelay: "500ms" }}
        >
          <p className="text-xs text-white/40">
            © {year} EscrowGo. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <a
              href="#contact"
              className="group inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-400/90 transition-colors hover:text-amber-300"
            >
              Get in touch
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:text-amber-400"
            >
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
