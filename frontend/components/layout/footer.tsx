import { Coffee, Link2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="evo-footer">
      <div className="mx-auto flex w-[min(1100px,calc(100%-28px))] flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
        <span className="inline-flex items-center gap-2"><Link2 className="h-3.5 w-3.5"/> EVO Bypass</span>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <a href="https://buymeacoffee.com/Officialknightly" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5"><Coffee className="h-3.5 w-3.5"/> Donate</a>
          <a href="https://izen.lol/blog/izen-userscript" target="_blank" rel="noopener noreferrer">Userscript guide</a>
        </div>
      </div>
    </footer>
  );
}
