import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { MobileShell, PageHeader } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const EMOJIS = ["🧒", "👦", "👧", "👶", "🧑‍🦱", "👨‍🦰"];

export const Route = createFileRoute("/children")({
  component: ChildrenPage,
  ssr: false,
});

function ChildrenPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["children", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("children").select("*").order("created_at")).data ?? [],
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [emoji, setEmoji] = useState("🧒");

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("children").insert({
        parent_id: user!.id, name, date_of_birth: dob || null, avatar_emoji: emoji,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${name} added!`);
      setOpen(false); setName(""); setDob(""); setEmoji("🧒");
      qc.invalidateQueries({ queryKey: ["children"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("children").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["children"] });
    },
  });

  return (
    <MobileShell>
      <PageHeader
        title="My kids"
        subtitle="Manage your children's profiles"
        right={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full"><Plus className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogTitle>Add a child</DialogTitle>
              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl mt-1" placeholder="e.g. Aarav" />
                </div>
                <div>
                  <Label className="text-xs">Date of birth</Label>
                  <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-11 rounded-xl mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Avatar</Label>
                  <div className="flex gap-2 mt-2">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={`h-12 w-12 rounded-xl text-2xl flex items-center justify-center border ${
                          emoji === e ? "border-primary bg-primary/10" : "border-border bg-card"
                        }`}
                      >{e}</button>
                    ))}
                  </div>
                </div>
                <Button disabled={!name || add.isPending} onClick={() => add.mutate()} className="w-full rounded-2xl h-11">
                  {add.isPending ? "Adding…" : "Save child"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="px-5 space-y-3">
        {data.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-2xl">👶</p>
            <p className="font-semibold mt-1">No children yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add a child to start booking dental visits.</p>
          </div>
        )}
        {data.map((c: any) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">{c.avatar_emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{c.name}</p>
              {c.date_of_birth && (
                <p className="text-xs text-muted-foreground">
                  Age {Math.max(0, new Date().getFullYear() - new Date(c.date_of_birth).getFullYear())}
                </p>
              )}
            </div>
            <button onClick={() => del.mutate(c.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
