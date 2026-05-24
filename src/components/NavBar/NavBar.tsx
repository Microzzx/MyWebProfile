"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BsList, BsXLg } from "react-icons/bs";

type Props = React.HTMLAttributes<HTMLElement>;

const NAV_ITEMS = [
  { label: "About", href: "#Aboutme" },
  { label: "Skills", href: "#Skills" },
  { label: "Projects", href: "#Project" },
  { label: "Contact", href: "#Contact" },
];

const NavBar = ({ className, ...rest }: Props) => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
        className={`relative mx-auto flex h-[68px] max-w-6xl items-center justify-between rounded-2xl border px-4 transition-all duration-300 sm:px-5 ${
          isScrolled || open
            ? "border-white/[0.09] bg-zinc-950/80 shadow-2xl shadow-black/35 backdrop-blur-xl"
            : "border-white/[0.06] bg-zinc-950/35 backdrop-blur-md"
        }`}
      >
        <Link
          href="/#Profile"
          onClick={() => setOpen(false)}
          className="group flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-300 ring-1 ring-violet-400/25 transition-colors group-hover:bg-violet-500/25">
            MP
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-white/95 sm:text-base">
              My Portfolio
            </span>
            <span className="text-[10px] uppercase tracking-[0.24em] text-white/35">
              Front-end developer
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-violet-300"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/[0.06] hover:text-violet-300 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        >
          {open ? <BsXLg size={20} /> : <BsList size={23} />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          className="mx-auto mt-3 flex max-w-6xl flex-col gap-1 rounded-2xl border border-white/[0.09] bg-zinc-950/90 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl lg:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-violet-300"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
