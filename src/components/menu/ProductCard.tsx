import { Plus, UtensilsCrossed } from "lucide-react";
import { formatBRL, type Product } from "@/lib/menu";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: Product;
  onOpen: (p: Product) => void;
  onAdd: (p: Product) => void;
}

export function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (!src)
    return (
      <div className={cn("flex items-center justify-center bg-secondary text-muted-foreground", className)}>
        <UtensilsCrossed className="h-8 w-8 opacity-50" aria-hidden />
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
}

export function ProductCard({ product, onOpen, onAdd }: ProductCardProps) {
  const unavailable = !product.available;
  return (
    <article
      className={cn(
        "group flex gap-4 rounded-3xl border border-border/80 bg-card/95 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-card",
        unavailable && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="flex flex-1 gap-4 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <ProductImage src={product.image} alt={product.name} className="h-24 w-24 shrink-0 rounded-2xl sm:h-28 sm:w-28" />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start gap-2">
            <h3 className="text-base font-semibold leading-tight sm:text-lg">{product.name}</h3>
            {product.featured && (
              <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                Destaque
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="mt-auto pt-2 font-semibold text-primary">
            {unavailable ? <span className="text-sm text-muted-foreground">Indisponível</span> : formatBRL(Number(product.price))}
          </div>
        </div>
      </button>
      <button
        type="button"
        disabled={unavailable}
        onClick={() => onAdd(product)}
        aria-label={`Adicionar ${product.name}`}
        className="self-end rounded-full bg-primary p-3 text-primary-foreground shadow-sm transition duration-200 hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
      >
        <Plus className="h-5 w-5" />
      </button>
    </article>
  );
}
