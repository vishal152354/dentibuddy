import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { MobileShell, PageHeader } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Baby, Lightbulb, LogOut, Mail, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  ssr: false,
});

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });
  const { data: kidsCount = 0 } = useQuery({
    queryKey: ["kids-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("children").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: visitsCount = 0 } = useQuery({
    queryKey: ["visits-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("appointments").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <MobileShell>
      <PageHeader title="My profile" />
      <div className="px-5">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-glow p-5 text-primary-foreground shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">👤</div>
            <div className="min-w-0">
              <p className="font-bold text-lg truncate">{profile?.full_name ?? "Parent"}</p>
              <p className="text-xs opacity-90 inline-flex items-center gap-1 truncate">
                <Mail className="h-3 w-3" /> {user?.email}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Stat label="Kids" value={kidsCount} />
            <Stat label="Visits" value={visitsCount} />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Row to="/children" icon={<Baby className="h-4 w-4" />} label="My kids" />
          <Row to="/tips" icon={<Lightbulb className="h-4 w-4" />} label="Dental tips" />
        </div>

        <Button
          variant="outline"
          className="w-full mt-6 h-12 rounded-2xl text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="h-4 w-4 mr-1.5" /> Sign out
        </Button>

        <p className="text-center text-[11px] text-muted-foreground mt-6">DentiBuddy v1.0 · Made with 🦷 for happy kids</p>
      </div>
    </MobileShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 p-3 text-center backdrop-blur">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] uppercase tracking-wide opacity-90">{label}</p>
    </div>
  );
}

function Row({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to as any} className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
      <div className="h-9 w-9 rounded-lg bg-secondary text-primary flex items-center justify-center">{icon}</div>
      <span className="flex-1 font-medium text-sm">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
