import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell, PageHeader } from "@/components/mobile-shell";
import { Input } from "@/components/ui/input";
import { Search, Star, MapPin } from "lucide-react";

export const Route = createFileRoute("/dentists/")({
  component: DentistsPage,
  ssr: false,
});

function DentistsPage() {
  const [q, setQ] = useState("");
  const { data = [] } = useQuery({
    queryKey: ["dentists"],
    queryFn: async () => {
      const { data } = await supabase.from("dentists").select("*").order("rating", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = data.filter((d: any) => {
    const s = q.toLowerCase();
    return !s || d.name.toLowerCase().includes(s) || d.city?.toLowerCase().includes(s) || d.clinic_name.toLowerCase().includes(s);
  });

  return (
    <MobileShell>
      <PageHeader title="Find a dentist" subtitle="Trusted pediatric dentists near you" />
      <div className="px-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, clinic, or city"
            className="h-12 pl-10 rounded-2xl bg-card"
          />
        </div>
      </div>

      <div className="px-5 mt-5 space-y-3">
        {filtered.map((d: any) => (
          <Link key={d.id} to="/dentists/$id" params={{ id: d.id }} className="block rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
            <div className="flex gap-3">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-mint flex items-center justify-center text-3xl shrink-0">
                👩‍⚕️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold shrink-0">
                    <Star className="h-3.5 w-3.5 fill-sunshine text-sunshine" /> {d.rating}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {d.clinic_name} · {d.city}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium text-primary">₹{d.consultation_fee} · {d.experience_years}+ yrs</span>
                  {d.available_today && (
                    <span className="text-[10px] font-bold uppercase rounded-full bg-mint text-mint-foreground px-2 py-0.5">
                      Available today
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">No dentists found.</p>
        )}
      </div>
    </MobileShell>
  );
}
