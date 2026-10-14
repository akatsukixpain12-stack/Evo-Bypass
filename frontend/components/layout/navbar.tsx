"use client";

import { Coffee, Moon, Sparkles, Sun } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.header className="evo-nav sticky top-0 z-50" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, type: "spring", stiffness: 180, damping: 24 }}>
      <div className="mx-auto flex w-[min(1100px,calc(100%-28px))] items-center justify-between gap-4 py-3">
        <Link className="flex items-center gap-2.5 text-sm font-semibold" href="/">
          <span className="evo-logo evo-logo-small"><Sparkles className="h-4 w-4"/></span>
          <span>EVO BYPASS</span>
        </Link>
        <div className="flex items-center gap-2">
          <a className="evo-nav-link inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm" href="https://buymeacoffee.com/Officialknightly" target="_blank" rel="noopener noreferrer"><Coffee className="h-4 w-4"/> <span className="hidden sm:inline">Donate</span></a>
          <button aria-label="Toggle theme" title="Toggle theme" className="evo-theme-button rounded-full p-2.5" onClick={toggleTheme}>{theme === "dark" ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}</button>
        </div>
      </div>
    </motion.header>
  );
}
