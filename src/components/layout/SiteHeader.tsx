"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BsList, BsMoonStars, BsSun, BsXLg } from "react-icons/bs";

type Props = React.HTMLAttributes<HTMLElement>;
type Theme = "dark" | "light";

const NAV_ITEMS = [
  { label: "About", href: "#About" },
  { label: "Experience", href: "#Experience" },
  { label: "Skills", href: "#Skills" },
  { label: "Education", href: "#Education" },
  { label: "Contact", href: "#Contact" },
];

const SiteHeader = ({ className, ...rest }: Props) => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("portfolio-theme");
    const nextTheme: Theme = storedTheme === "light" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("portfolio-theme", nextTheme);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <nav
      aria-label="Primary navigation"
      className={`fixed inset-x-0 top-0 px-4 pt-4 sm:px-6 ${className ?? ""}`}
      {...rest}
    >
      <div
        className={`theme-panel relative mx-auto flex h-[68px] max-w-6xl items-center justify-between rounded-2xl border px-4 backdrop-blur-xl transition-all duration-300 sm:px-5 ${
          isScrolled || open ? "shadow-2xl" : ""
        }`}
      >
        <Link
          href="/#Profile"
          onClick={() => setOpen(false)}
          className="group flex items-center gap-3"
        >
          <span className="theme-accent-soft theme-accent-text flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ring-1 ring-violet-400/25 transition-colors group-hover:bg-violet-500/25">
            JP
          </span>
          <span className="flex flex-col">
            <span className="theme-text-primary text-sm font-semibold tracking-wide sm:text-base">
              Janekit Prakittawornkul
            </span>
            <span className="theme-text-subtle text-[10px] uppercase tracking-[0.24em]">
              Backend / Web Developer
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="theme-hover theme-text-muted block rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={toggleTheme}
            className="theme-hover theme-text-muted flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <BsSun size={19} /> : <BsMoonStars size={18} />}
          </button>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="theme-hover theme-text-muted flex h-10 w-10 items-center justify-center rounded-xl transition-colors lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          >
            {open ? <BsXLg size={20} /> : <BsList size={23} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          className="theme-panel mx-auto mt-3 flex max-w-6xl flex-col gap-1 rounded-2xl border p-2 backdrop-blur-xl lg:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="theme-hover theme-text-muted rounded-xl px-4 py-3 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default SiteHeader;
