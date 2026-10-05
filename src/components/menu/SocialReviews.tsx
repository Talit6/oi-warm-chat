import { ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Settings } from "@/lib/menu";

export function SocialReviews({ settings }: { settings: Settings }) {
  const rating = settings.google_rating != null ? Number(settings.google_rating) : null;
  const reviewsLink = settings.google_maps;
  const leaveReview = settings.google_review_url || settings.google_maps;

  if (rating == null && !reviewsLink && !leaveReview) return null;

  return (
    <section id="avaliacoes" className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <div className="relative isolate overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-card via-card to-secondary/60 p-6 shadow-card sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
              Avaliações no Google
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold leading-tight sm:text-3xl">
              A experiência de quem já nos visitou
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Confira as avaliações e compartilhe sua experiência com o restaurante.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {reviewsLink && (
                <Button asChild variant="outline" className="rounded-full border-primary/25 bg-background/70 px-5 hover:bg-background">
                  <a href={reviewsLink} target="_blank" rel="noopener noreferrer">
                    Ver avaliações <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {leaveReview && (
                <Button asChild variant="hero" className="rounded-full px-5 shadow-sm">
                  <a href={leaveReview} target="_blank" rel="noopener noreferrer">
                    <Star className="h-4 w-4" /> Avaliar no Google
                  </a>
                </Button>
              )}
            </div>
          </div>
          {rating != null && (
            <div className="flex min-w-40 items-center gap-4 rounded-2xl border border-primary/10 bg-background/75 px-5 py-4 md:flex-col md:gap-2 md:px-8 md:py-6">
              <span className="font-display text-5xl font-semibold leading-none tracking-tight text-foreground">
                {rating.toFixed(1).replace(".", ",")}
              </span>
              <div>
                <div className="flex text-amber-500" aria-label={`${rating} de 5 estrelas`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4" fill={i <= Math.round(rating) ? "currentColor" : "none"} />
                  ))}
                </div>
                {settings.google_reviews_count != null && (
                  <p className="mt-1 text-xs text-muted-foreground">{settings.google_reviews_count} avaliações</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
