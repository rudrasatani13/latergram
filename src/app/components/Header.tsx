import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Logo } from "./Logo";
import { useAuth } from "../auth/useAuth";

interface HeaderProps {
  current: "landing" | "auth" | "home";
  variant?: "full" | "minimal";
}

const easeSoft = [0.22, 1, 0.36, 1] as const;

export function Header({ current, variant = "full" }: HeaderProps) {
  const navigate = useNavigate();
  const { session, user, signOut } = useAuth();

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
        <button onClick={() => navigate((session || user) ? "/app" : "/")} className="flex items-center">
          <Logo />
        </button>

        {variant === "full" ? (
          <>
            <nav className="hidden md:flex items-center gap-7">
              {links.filter(l => !(session || user) || l.path !== "/").map((l) => (
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
            {session || user ? (
              <div className="flex items-center gap-4">
                <span className="hidden md:inline text-[var(--lg-cocoa)] text-sm truncate max-w-[150px]">
                  {user?.email || "signed in"}
                </span>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                  className="px-4 py-2 rounded-full border border-[var(--lg-rose-soft)] text-[var(--lg-rose)] hover:bg-[var(--lg-rose-soft)] hover:text-white transition-colors duration-300"
                  style={{ fontSize: "0.9rem", fontWeight: 500 }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className={`px-5 py-2.5 rounded-full bg-[var(--lg-rose)] text-white hover:bg-[var(--lg-focus-rose)] transition-colors duration-300 shadow-[0_8px_22px_-12px_rgba(200,110,124,0.5)] ${
                  current === "auth" ? "ring-2 ring-[var(--lg-rose-soft)]/60" : ""
                }`}
                style={{ fontSize: "0.95rem", fontWeight: 600 }}
              >
                Sign in
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-4">
            {session || user ? (
              <>
                <span className="hidden md:inline text-[var(--lg-cocoa)] text-sm truncate max-w-[150px]">
                  {user?.email || "signed in"}
                </span>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                  className="px-4 py-2 rounded-full border border-[var(--lg-rose-soft)] text-[var(--lg-rose)] hover:bg-[var(--lg-rose-soft)] hover:text-white transition-colors duration-300"
                  style={{ fontSize: "0.9rem", fontWeight: 500 }}
                >
                  Sign out
                </button>
              </>
            ) : current !== "home" ? (
              <button
                onClick={() => navigate("/app")}
                className="text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-300"
                style={{ fontSize: "0.95rem", fontWeight: 500 }}
              >
                ← Back to app
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className={`px-5 py-2.5 rounded-full bg-[var(--lg-rose)] text-white hover:bg-[var(--lg-focus-rose)] transition-colors duration-300 shadow-[0_8px_22px_-12px_rgba(200,110,124,0.5)]`}
                style={{ fontSize: "0.95rem", fontWeight: 600 }}
              >
                Sign in
              </button>
            )}
          </div>
        )}
      </div>
    </motion.header>
  );
}
