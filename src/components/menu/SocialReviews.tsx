import { Facebook, Instagram, Music2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Settings } from "@/lib/menu";

function socialUrl(base: string, handle: string): string {
  if (handle.startsWith("http")) return handle;
  return `${base}${handle.replace(/^@/, "")}`;
}

export function SocialReviews({ settings }: { settings: Settings }) {
  const socials = [
    { label: "Instagram", icon: Instagram, href: socialUrl("https://instagram.com/", settings.instagram || "https://www.instagram.com/restaurante_korujas?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==") },
    settings.facebook && { label: "Facebook", icon: Facebook, href: socialUrl("https://facebook.com/", settings.facebook) },
    settings.tiktok && { label: "TikTok", icon: Music2, href: socialUrl("https://tiktok.com/@", settings.tiktok) },
  ].filter(Boolean) as { label: string; icon: typeof Instagram; href: string }[];

  const rating = settings.google_rating != null ? Number(settings.google_rating) : null;
  const reviewsLink = settings.google_maps;
  const leaveReview = settings.google_review_url || settings.google_maps;

  return (
    <section id="avaliacoes" className="mx-auto max-w-5xl px-4 pt-12">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Avaliações no Google</p>
          {rating != null ? (
            <div className="mt-3 flex items-end gap-3">
              <span className="font-display text-5xl font-semibold">{rating.toFixed(1).replace(".", ",")}</span>
              <div className="pb-1">
                <div className="flex text-primary" aria-label={`${rating} de 5 estrelas`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5" fill={i <= Math.round(rating) ? "currentColor" : "none"} />
                  ))}
                </div>
                {settings.google_reviews_count != null && (
                  <p className="text-sm text-muted-foreground">{settings.google_reviews_count} avaliações</p>
                )}
              </div>
            </div>
          ) : (
            <h2 className="mt-3 text-2xl font-semibold">O que nossos clientes dizem</h2>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {reviewsLink && (
              <Button asChild variant="outline" className="rounded-full">
                <a href={reviewsLink} target="_blank" rel="noopener noreferrer">Ver avaliações</a>
              </Button>
            )}
            {leaveReview && (
              <Button asChild variant="hero" className="rounded-full">
                <a href={leaveReview} target="_blank" rel="noopener noreferrer"><Star className="h-4 w-4" /> Avaliar no Google</a>
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Redes sociais</p>
          <h2 className="mt-3 text-2xl font-semibold">Siga o Koruja's</h2>
          {socials.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Em breve.</p>
          ) : (
            <ul className="mt-6 flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary">
                    <s.icon className="h-4 w-4" /> {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
