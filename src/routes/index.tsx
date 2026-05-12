import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sparkles, Stethoscope, MessageCircle, Siren } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  ssr: false,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/home" });
  }, [user, loading, navigate]);

  return (
    <div className="phone-frame min-h-dvh flex flex-col">
      <div className="flex-1 px-6 pt-14 pb-8 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white text-xl">
            🦷
          </div>
          <span className="text-xl font-bold tracking-tight">DentiBuddy</span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-medium text-mint-foreground mb-4">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered pediatric care
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Bright smiles for <span className="text-primary">little</span> humans.
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Book trusted pediatric dentists, get instant AI guidance, and keep your child's dental
            health on track — all in one friendly app.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Feature icon={<Stethoscope className="h-4 w-4" />} label="Find dentists" />
            <Feature icon={<MessageCircle className="h-4 w-4" />} label="Ask Buddy AI" />
            <Feature icon={<Sparkles className="h-4 w-4" />} label="Track visits" />
            <Feature icon={<Siren className="h-4 w-4" />} label="24/7 SOS" />
          </div>
        </div>

        <div className="mt-10 space-y-3">
          <Button asChild size="lg" className="w-full h-12 rounded-2xl text-base shadow-[var(--shadow-soft)]">
            <Link to="/auth">Get started</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our friendly Terms & Privacy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-card border border-border px-3 py-3 shadow-[var(--shadow-card)]">
      <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center text-primary">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
