import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell, PageHeader } from "@/components/mobile-shell";

export const Route = createFileRoute("/tips")({
  component: TipsPage,
  ssr: false,
});

function TipsPage() {
  const { data = [] } = useQuery({
    queryKey: ["tips"],
    queryFn: async () => (await supabase.from("tips").select("*").order("created_at")).data ?? [],
  });

  return (
    <MobileShell>
      <PageHeader title="Dental tips" subtitle="Daily care for healthy little smiles" />
      <div className="px-5 space-y-3">
        {data.map((t: any) => (
          <div key={t.id} className="rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-mint flex items-center justify-center text-2xl shrink-0">{t.emoji}</div>
              <div>
                <p className="font-semibold">{t.title}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t.content}</p>
                <span className="text-[10px] uppercase font-bold text-primary mt-2 inline-block">{t.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
