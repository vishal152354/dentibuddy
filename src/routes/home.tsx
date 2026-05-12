import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { MobileShell } from "@/components/mobile-shell";
import { Calendar, MessageCircle, Siren, Stethoscope, Lightbulb, Plus, ChevronRight, Star } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: HomePage,
  ssr: false,
});

function HomePage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: children = [] } = useQuery({
    queryKey: ["children", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("children").select("*").order("created_at");
      return data ?? [];
    },
  });

  const { data: nextAppt } = useQuery({
    queryKey: ["next-appt", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("appointments")
        .select("*, dentists(name, clinic_name), children(name)")
        .gte("appointment_date", today)
        .order("appointment_date")
        .order("appointment_time")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: featuredDentists = [] } = useQuery({
    queryKey: ["featured-dentists"],
    queryFn: async () => {
      const { data } = await supabase.from("dentists").select("*").order("rating", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const { data: tip } = useQuery({
    queryKey: ["tip-of-day"],
    queryFn: async () => {
      const { data } = await supabase.from("tips").select("*").limit(20);
      if (!data?.length) return null;
      return data[Math.floor(Math.random() * data.length)];
    },
  });

  const firstName = (profile?.full_name ?? user?.email ?? "there").split(" ")[0];

  return (
    <MobileShell>
      <div className="bg-gradient-to-b from-primary/15 via-primary/5 to-transparent px-5 pt-8 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Hi parent 👋</p>
            <h1 className="text-2xl font-bold mt-0.5">Hello, {firstName}</h1>
            <p className="text-sm text-muted-foreground mt-1">Let's keep little smiles bright today.</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-white flex items-center justify-center text-2xl shadow-[var(--shadow-soft)]">
            🦷
          </div>
        </div>

        {nextAppt ? (
          <Link to="/appointments" className="mt-5 block rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-mint flex items-center justify-center text-mint-foreground">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Next visit</p>
                <p className="font-semibold truncate">
                  {(nextAppt as any).children?.name} · {(nextAppt as any).dentists?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date((nextAppt as any).appointment_date).toDateString()} at {(nextAppt as any).appointment_time?.slice(0,5)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        ) : (
          <Link to="/dentists" className="mt-5 block rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-sunshine flex items-center justify-center text-sunshine-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">No upcoming visit</p>
                <p className="text-xs text-muted-foreground">Tap to book a pediatric dentist</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        )}
      </div>

      <div className="px-5 -mt-1">
        <div className="grid grid-cols-4 gap-3">
          <Quick to="/dentists" icon={<Stethoscope className="h-5 w-5" />} label="Dentists" tone="bg-secondary text-primary" />
          <Quick to="/chatbot" icon={<MessageCircle className="h-5 w-5" />} label="Buddy" tone="bg-mint text-mint-foreground" />
          <Quick to="/emergency" icon={<Siren className="h-5 w-5" />} label="SOS" tone="bg-coral text-coral-foreground" />
          <Quick to="/tips" icon={<Lightbulb className="h-5 w-5" />} label="Tips" tone="bg-sunshine text-sunshine-foreground" />
        </div>
      </div>

      {/* Children */}
      <section className="px-5 mt-7">
        <SectionHeader title="My kids" actionLabel="Manage" actionTo="/children" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          {children.map((c: any) => (
            <div key={c.id} className="min-w-[110px] rounded-2xl bg-card border border-border p-3 text-center shadow-[var(--shadow-card)]">
              <div className="h-12 w-12 mx-auto rounded-xl bg-secondary flex items-center justify-center text-2xl">
                {c.avatar_emoji ?? "🧒"}
              </div>
              <p className="text-sm font-semibold mt-2 truncate">{c.name}</p>
              {c.date_of_birth && (
                <p className="text-[11px] text-muted-foreground">
                  {Math.max(0, new Date().getFullYear() - new Date(c.date_of_birth).getFullYear())} yrs
                </p>
              )}
            </div>
          ))}
          <Link to="/children" className="min-w-[110px] rounded-2xl border-2 border-dashed border-border p-3 flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
            <Plus className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Add child</span>
          </Link>
        </div>
      </section>

      {/* Featured dentists */}
      <section className="px-5 mt-7">
        <SectionHeader title="Top rated nearby" actionLabel="See all" actionTo="/dentists" />
        <div className="space-y-3">
          {featuredDentists.slice(0, 3).map((d: any) => (
            <Link key={d.id} to="/dentists/$id" params={{ id: d.id }} className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3 shadow-[var(--shadow-card)]">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-mint flex items-center justify-center text-2xl">
                👩‍⚕️
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{d.name}</p>
                <p className="text-xs text-muted-foreground truncate">{d.clinic_name} · {d.city}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Star className="h-3.5 w-3.5 fill-sunshine text-sunshine" /> {d.rating}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tip */}
      {tip && (
        <section className="px-5 mt-7 mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-mint to-accent p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 text-mint-foreground/80 text-xs font-medium uppercase tracking-wide">
              <Lightbulb className="h-3.5 w-3.5" /> Tip of the day
            </div>
            <p className="mt-2 font-semibold text-mint-foreground">
              {tip.emoji} {tip.title}
            </p>
            <p className="mt-1 text-sm text-mint-foreground/80 leading-relaxed">{tip.content}</p>
          </div>
        </section>
      )}
    </MobileShell>
  );
}

function Quick({ to, icon, label, tone }: { to: string; icon: React.ReactNode; label: string; tone: string }) {
  return (
    <Link to={to as any} className="flex flex-col items-center gap-1.5">
      <div className={`h-14 w-14 rounded-2xl ${tone} flex items-center justify-center shadow-[var(--shadow-card)]`}>
        {icon}
      </div>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}

function SectionHeader({ title, actionLabel, actionTo }: { title: string; actionLabel?: string; actionTo?: string }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {actionTo && (
        <Link to={actionTo as any} className="text-xs font-medium text-primary">
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}
