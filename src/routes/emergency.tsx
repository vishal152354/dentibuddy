import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/emergency")({
  component: EmergencyPage,
  ssr: false,
});

const STEPS = [
  { title: "Knocked-out tooth", body: "Rinse the tooth gently with milk (not water). Try to place it back in the socket. If not, store it in milk and reach a dentist within 30 mins." },
  { title: "Severe tooth pain", body: "Rinse with warm salt water. Apply a cold compress on the cheek. Avoid hot or sugary food. Book an emergency visit now." },
  { title: "Bleeding gums", body: "Press a clean wet gauze against the area for 10 minutes. If bleeding doesn't stop, call your dentist immediately." },
  { title: "Broken or chipped tooth", body: "Save any broken pieces. Rinse the mouth with warm water. Use a cold compress to reduce swelling and book a visit today." },
  { title: "Swollen face or jaw", body: "This may indicate an infection. Apply a cold compress and contact a pediatric dentist or doctor without delay." },
];

function EmergencyPage() {
  return (
    <MobileShell>
      <PageHeader title="Emergency 🚨" subtitle="Quick first-aid & rapid help" />
      <div className="px-5 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-coral to-destructive p-5 text-coral-foreground shadow-[var(--shadow-soft)]">
          <p className="text-xs font-bold uppercase tracking-wide opacity-90">If life-threatening</p>
          <p className="text-2xl font-bold mt-1">Call 112 immediately</p>
          <Button asChild variant="secondary" className="mt-4 rounded-2xl w-full h-12">
            <a href="tel:112"><Phone className="h-4 w-4 mr-1.5" /> Call emergency line</a>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-14 rounded-2xl flex-col gap-0.5">
            <Link to="/dentists">
              <Stethoscope className="h-5 w-5" />
              <span className="text-xs font-medium">Find dentist</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-14 rounded-2xl flex-col gap-0.5">
            <Link to="/chatbot">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Ask Buddy</span>
            </Link>
          </Button>
        </div>

        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mt-4 mb-2">First-aid guide</h2>
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-coral text-coral-foreground text-xs font-bold flex items-center justify-center">{i+1}</span>
                  <p className="font-semibold">{s.title}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
