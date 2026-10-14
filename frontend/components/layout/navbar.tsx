"use client";

import { Activity, Bot, CircleDollarSign, Home, Link2, LockKeyhole, Moon, Newspaper, Sparkles, Sun, Tag } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { navItems } from "@/lib/data";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const iconMap = {
  "/": Home,
  "/supported": Link2,
  "/pricing": Tag,
  "/bot": Bot,
  "/blog": Newspaper
};

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-[color:var(--border-color)] bg-[color:var(--nav-bg)] backdrop-blur-xl"
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.42, type: "spring", stiffness: 170, damping: 22 }}
    >
      <div className="mx-auto flex w-[min(1180px,calc(100%-24px))] items-center justify-between gap-3 py-3">
        <Link className="flex shrink-0 items-center gap-2.5 text-sm font-semibold text-[color:var(--text-primary)]" href="/">
          <span className="brand-mark"><Sparkles className="h-5 w-5" /></span>
          <span className="font-display text-sm tracking-[0.12em] sm:text-base">EVO BYPASS</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = iconMap[item.href as keyof typeof iconMap];
            return (
              <Link
                key={item.href}
                className={cn("nav-pill", pathname === item.href && "nav-pill-active")}
                href={item.href}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            className="nav-donate hidden sm:inline-flex"
            href="https://urpy.link/gkLVl4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CircleDollarSign className="h-4 w-4 text-violet-200" />
            Support
          </Link>
          <Link className="nav-icon hidden sm:inline-flex" href="/auth" aria-label="Sign in" title="Sign in">
            <LockKeyhole className="h-4 w-4" />
          </Link>
          <Link className="nav-icon" href="/status" aria-label="API status" title="API status">
            <Activity className="h-4 w-4" />
          </Link>
          <button
            aria-label="Toggle theme"
            title="Toggle theme"
            className="nav-icon"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-[min(1180px,calc(100%-24px))] gap-1.5 overflow-x-auto pb-3 lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            className={cn("nav-pill whitespace-nowrap", pathname === item.href && "nav-pill-active")}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
        <Link className="nav-pill whitespace-nowrap" href="/auth">
          <LockKeyhole className="h-4 w-4" /> Sign in
        </Link>
      </div>
    </motion.header>
  );
}
