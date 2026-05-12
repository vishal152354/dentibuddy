import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Calendar, MessageCircle, Siren, User } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/auth-context";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/appointments", label: "Visits", icon: Calendar },
  { to: "/chatbot", label: "Buddy", icon: MessageCircle },
  { to: "/emergency", label: "SOS", icon: Siren },
  { to: "/profile", label: "Me", icon: User },
] as const;

export function MobileShell({ children, hideTabs = false }: { children: ReactNode; hideTabs?: boolean }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="phone-frame min-h-dvh flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="phone-frame min-h-dvh flex flex-col">
      <main className={`flex-1 ${hideTabs ? "" : "pb-20"}`}>{children}</main>
      {!hideTabs && (
        <nav className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-[430px] z-50 border-t border-border bg-card/95 backdrop-blur-md">
          <ul className="grid grid-cols-5">
            {tabs.map((t) => {
              const active = loc.pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <li key={t.to}>
                  <Link
                    to={t.to}
                    className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="px-5 pt-6 pb-4 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
