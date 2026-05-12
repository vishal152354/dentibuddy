import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/book/$dentistId")({
  component: BookPage,
  ssr: false,
});

const TIMES = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"];

function BookPage() {
  const { dentistId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: dentist } = useQuery({
    queryKey: ["dentist", dentistId],
    queryFn: async () => (await supabase.from("dentists").select("*").eq("id", dentistId).maybeSingle()).data,
  });
  const { data: children = [] } = useQuery({
    queryKey: ["children", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("children").select("*").order("created_at")).data ?? [],
  });

  const [childId, setChildId] = useState("");
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function book(e: React.FormEvent) {
    e.preventDefault();
    if (!childId) return toast.error("Please choose a child");
    if (!time) return toast.error("Please pick a time slot");
    setBusy(true);
    const { error } = await supabase.from("appointments").insert({
      parent_id: user!.id, child_id: childId, dentist_id: dentistId,
      appointment_date: date, appointment_time: time, reason, status: "confirmed",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Visit booked! 🎉");
    navigate({ to: "/appointments" });
  }

  return (
    <MobileShell hideTabs>
      <div className="px-5 pt-6">
        <button onClick={() => navigate({ to: "/dentists/$id", params: { id: dentistId } })} className="inline-flex items-center text-sm gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>
      <div className="px-5 pt-4 pb-10">
        <h1 className="text-2xl font-bold">Book a visit</h1>
        {dentist && <p className="text-sm text-muted-foreground mt-1">with {dentist.name} · {dentist.clinic_name}</p>}

        <form onSubmit={book} className="mt-6 space-y-5">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Child</Label>
            {children.length === 0 ? (
              <div className="mt-2 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Add a child profile first.{" "}
                <button type="button" onClick={() => navigate({ to: "/children" })} className="text-primary font-medium underline">
                  Add now
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {children.map((c: any) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setChildId(c.id)}
                    className={`rounded-2xl border p-3 text-left ${
                      childId === c.id ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <div className="text-xl">{c.avatar_emoji ?? "🧒"}</div>
                    <div className="text-sm font-semibold mt-1">{c.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Date</Label>
            <Input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 rounded-xl bg-card mt-2"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Time slot</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {TIMES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTime(t)}
                  className={`rounded-xl py-2.5 text-sm font-medium border ${
                    time === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. routine check-up, tooth pain, cleaning…"
              className="mt-2 rounded-xl bg-card min-h-[80px]"
            />
          </div>

          <Button disabled={busy} className="w-full h-12 rounded-2xl shadow-[var(--shadow-soft)]" size="lg">
            {busy ? "Booking…" : "Confirm booking"}
          </Button>
        </form>
      </div>
    </MobileShell>
  );
}
