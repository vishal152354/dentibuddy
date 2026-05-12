import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, MapPin, BadgeCheck, Phone } from "lucide-react";

export const Route = createFileRoute("/dentists/$id")({
  component: DentistDetail,
  ssr: false,
});

function DentistDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: d } = useQuery({
    queryKey: ["dentist", id],
    queryFn: async () => {
      const { data } = await supabase.from("dentists").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  if (!d) {
    return (
      <MobileShell hideTabs>
        <div className="px-5 pt-10 text-muted-foreground text-center">Loading…</div>
      </MobileShell>
    );
  }

  return (
    <MobileShell hideTabs>
      <div className="bg-gradient-to-b from-primary/20 via-mint to-transparent px-5 pt-6 pb-8">
        <button onClick={() => navigate({ to: "/dentists" })} className="inline-flex items-center text-sm gap-1 text-foreground/70 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="mt-6 flex items-center gap-4">
          <div className="h-20 w-20 rounded-3xl bg-card flex items-center justify-center text-4xl shadow-[var(--shadow-soft)]">
            👩‍⚕️
          </div>
          <div>
            <h1 className="text-xl font-bold">{d.name}</h1>
            <p className="text-sm text-muted-foreground">{d.specialty}</p>
            <div className="flex items-center gap-3 mt-1.5 text-sm">
              <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-sunshine text-sunshine" /> {d.rating}</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground"><BadgeCheck className="h-3.5 w-3.5" /> {d.experience_years}+ yrs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-2 space-y-4">
        <div className="rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">About</p>
          <p className="mt-2 text-sm leading-relaxed">{d.bio}</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Clinic</p>
          <p className="mt-2 font-semibold">{d.clinic_name}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5" /> {d.address}, {d.city}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Consultation" value={`₹${d.consultation_fee}`} />
          <Stat label="Experience" value={`${d.experience_years} yrs`} />
        </div>
      </div>

      <div className="px-5 mt-6 pb-8 grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 rounded-2xl" asChild>
          <a href={`tel:+910000000000`}><Phone className="h-4 w-4 mr-1" /> Call</a>
        </Button>
        <Button asChild className="h-12 rounded-2xl shadow-[var(--shadow-soft)]">
          <Link to="/book/$dentistId" params={{ dentistId: d.id }}>Book visit</Link>
        </Button>
      </div>
    </MobileShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 text-center shadow-[var(--shadow-card)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold text-lg mt-0.5">{value}</p>
    </div>
  );
}
