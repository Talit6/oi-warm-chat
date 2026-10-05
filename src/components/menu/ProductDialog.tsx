import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBRL, type Product } from "@/lib/menu";
import { ProductImage } from "./ProductCard";

export interface ProductDialogProps {
  product: Product | null;
  categoryName?: string | undefined;
  onClose: () => void;
  onAdd: (p: Product, qty: number) => void;
}

export function ProductDialog({ product, categoryName, onClose, onAdd }: ProductDialogProps) {
  const [qty, setQty] = useState(1);
  return (
    <Dialog open={!!product} onOpenChange={(o) => { if (!o) { onClose(); setQty(1); } }}>
      <DialogContent className="max-w-md overflow-hidden border-border bg-card p-0">
        {product && (
          <>
            <ProductImage src={product.image} alt={product.name} className="aspect-[4/3] w-full" />
            <div className="space-y-3 p-6">
              {categoryName && <p className="text-xs font-semibold uppercase tracking-widest text-primary">{categoryName}</p>}
              <DialogTitle className="font-display text-2xl">{product.name}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {product.description || "Sem descrição."}
              </DialogDescription>
              <p className="text-xl font-semibold text-primary">{formatBRL(Number(product.price))}</p>
              {product.available ? (
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center rounded-full border border-border">
                    <button type="button" aria-label="Diminuir" className="p-2.5" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
                    <button type="button" aria-label="Aumentar" className="p-2.5" onClick={() => setQty((q) => q + 1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button className="flex-1 rounded-full" size="lg" onClick={() => { onAdd(product, qty); setQty(1); }}>
                    Adicionar · {formatBRL(Number(product.price) * qty)}
                  </Button>
                </div>
              ) : (
                <p className="rounded-xl bg-muted p-3 text-center text-sm text-muted-foreground">Produto indisponível no momento</p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
