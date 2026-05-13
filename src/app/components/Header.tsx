import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Logo } from "./Logo";

interface HeaderProps {
  current: "landing" | "auth" | "home";
  variant?: "full" | "minimal";
}

const easeSoft = [0.22, 1, 0.36, 1] as const;

export function Header({ current, variant = "full" }: HeaderProps) {
  const navigate = useNavigate();

  const links = [
    { label: "Write", path: "/app" },
    { label: "About", path: "/" },
  ];

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: easeSoft }}
      className="px-6 md:px-10 py-5 relative z-20"
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        <button onClick={() => navigate("/")} className="flex items-center">
          <Logo />
        </button>

        {variant === "full" ? (
          <>
            <nav className="hidden md:flex items-center gap-7">
              {links.map((l) => (
                <button
                  key={l.label}
                  onClick={() => navigate(l.path)}
                  className="text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-300"
                  style={{ fontSize: "0.98rem", fontWeight: 500 }}
                >
                  {l.label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => navigate("/auth")}
              className={`px-5 py-2.5 rounded-full bg-[var(--lg-rose)] text-white hover:bg-[var(--lg-focus-rose)] transition-colors duration-300 shadow-[0_8px_22px_-12px_rgba(200,110,124,0.5)] ${
                current === "auth" ? "ring-2 ring-[var(--lg-rose-soft)]/60" : ""
              }`}
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              Sign in
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/app")}
            className="text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-300"
            style={{ fontSize: "0.95rem", fontWeight: 500 }}
          >
            ← Back to app
          </button>
        )}
      </div>
    </motion.header>
  );
}
