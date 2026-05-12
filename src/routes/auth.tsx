import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  ssr: false,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState("login");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/home" });
  }, [user, navigate]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
  }

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you're in!");
  }

  return (
    <div className="phone-frame min-h-dvh flex flex-col">
      <div className="px-5 pt-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
      <div className="flex-1 px-6 pt-6 pb-10 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white text-xl">
            🦷
          </div>
          <span className="text-xl font-bold">DentiBuddy</span>
        </div>

        <h2 className="text-2xl font-bold mb-1">Welcome 👋</h2>
        <p className="text-muted-foreground text-sm mb-6">Care for your child's smile in seconds.</p>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-5 rounded-2xl">
            <TabsTrigger value="login" className="rounded-xl">Log in</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={login} className="space-y-4">
              <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="parent@email.com" />
              <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
              <Button disabled={busy} className="w-full h-12 rounded-2xl" size="lg">
                {busy ? "Logging in…" : "Log in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signup} className="space-y-4">
              <Field label="Your name" value={name} onChange={setName} placeholder="Riya Sharma" />
              <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="parent@email.com" />
              <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="At least 8 characters" />
              <Button disabled={busy} className="w-full h-12 rounded-2xl" size="lg">
                {busy ? "Creating…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        required
        className="h-12 rounded-xl bg-card"
      />
    </div>
  );
}
