import { Clock, Instagram, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Settings } from "@/lib/menu";
import { whatsappUrl } from "@/lib/menu";

function instagramUrl(handle: string): string {
  if (handle.startsWith("http")) return handle;
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export function InfoSection({ settings }: { settings: Settings }) {
  const rows = [
    { icon: MapPin, label: "Endereço", value: settings.address || "Em breve" },
    { icon: Clock, label: "Horário", value: settings.opening_hours || "Consulte pelo WhatsApp" },
    { icon: MessageCircle, label: "WhatsApp", value: settings.whatsapp, href: whatsappUrl(settings.whatsapp) },
    { icon: Instagram, label: "Instagram", value: "@restaurante_korujas", href: instagramUrl(settings.instagram || "https://www.instagram.com/restaurante_korujas?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==") },
  ];
  return (
    <section id="info" className="mx-auto max-w-5xl px-4 pb-32 pt-12">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
        <h2 className="text-3xl font-semibold">Visite-nos</h2>
        <dl className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-3">
              <r.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">{r.label}</dt>
                <dd className="mt-1 whitespace-pre-line">
                  {r.href ? <a href={r.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{r.value}</a> : r.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
        {settings.google_maps && (
          <Button asChild variant="hero" size="lg" className="mt-8 w-full rounded-full font-bold uppercase tracking-wide sm:w-auto">
            <a href={settings.google_maps} target="_blank" rel="noopener noreferrer">Como chegar</a>
          </Button>
        )}
      </div>
    </section>
  );
}
