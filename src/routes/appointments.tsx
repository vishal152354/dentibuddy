import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { MobileShell, PageHeader } from "@/components/mobile-shell";
import { Calendar, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/appointments")({
  component: AppointmentsPage,
  ssr: false,
});

function AppointmentsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*, dentists(name, clinic_name, city), children(name, avatar_emoji)")
        .order("appointment_date", { ascending: false });
      return data ?? [];
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Visit cancelled");
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = data.filter((a: any) => a.appointment_date >= today && a.status !== "cancelled");
  const past = data.filter((a: any) => a.appointment_date < today || a.status === "cancelled");

  return (
    <MobileShell>
      <PageHeader title="Visits" subtitle="Your booked dental appointments" />
      <div className="px-5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-2xl mb-2">📅</p>
            <p className="font-semibold">No visits yet</p>
            <p className="text-sm text-muted-foreground mt-1">Book your child's first dental check-up.</p>
            <Button asChild className="mt-4 rounded-2xl">
              <Link to="/dentists">Find a dentist</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <Section title="Upcoming">
                {upcoming.map((a: any) => (
                  <ApptCard key={a.id} appt={a} onCancel={() => cancel.mutate(a.id)} cancellable />
                ))}
              </Section>
            )}
            {past.length > 0 && (
              <Section title="Past & cancelled">
                {past.map((a: any) => <ApptCard key={a.id} appt={a} />)}
              </Section>
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ApptCard({ appt, onCancel, cancellable }: { appt: any; onCancel?: () => void; cancellable?: boolean }) {
  const cancelled = appt.status === "cancelled";
  return (
    <div className={`rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)] ${cancelled ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-xl">
          {appt.children?.avatar_emoji ?? "🧒"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{appt.children?.name} · {appt.dentists?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{appt.dentists?.clinic_name}, {appt.dentists?.city}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(appt.appointment_date).toDateString()}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {appt.appointment_time?.slice(0, 5)}</span>
          </div>
          {appt.reason && <p className="mt-1 text-xs text-muted-foreground italic">"{appt.reason}"</p>}
        </div>
        {cancellable && (
          <button onClick={onCancel} aria-label="Cancel" className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-[10px] uppercase font-bold rounded-full px-2 py-0.5 ${
          cancelled ? "bg-destructive/10 text-destructive" : "bg-mint text-mint-foreground"
        }`}>
          {appt.status}
        </span>
      </div>
    </div>
  );
}
