import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { buildOrderMessage, formatBRL, whatsappUrl } from "@/lib/menu";

export function CartSheet({ restaurant, whatsapp }: { restaurant: string; whatsapp: string }) {
  const cart = useCart();

  function checkout() {
    if (cart.lines.length === 0) return;
    const url = whatsappUrl(whatsapp, buildOrderMessage(restaurant, cart.lines, cart.note));
    window.open(url, "_blank", "noopener");
  }

  return (
    <Sheet open={cart.open} onOpenChange={cart.setOpen}>
      <SheetContent side="right" className="flex w-full flex-col border-border bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="font-display text-2xl">Seu pedido</SheetTitle>
          <SheetDescription>Confira os itens antes de enviar.</SheetDescription>
        </SheetHeader>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10 opacity-50" />
            <p>Seu carrinho está vazio.</p>
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {cart.lines.map((l) => (
              <div key={l.productId} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{l.name}</p>
                  <p className="text-sm text-muted-foreground">{formatBRL(l.price)} un.</p>
                </div>
                <div className="flex items-center rounded-full border border-border">
                  <button aria-label={`Diminuir ${l.name}`} className="p-2" onClick={() => cart.setQuantity(l.productId, l.quantity - 1)}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{l.quantity}</span>
                  <button aria-label={`Aumentar ${l.name}`} className="p-2" onClick={() => cart.setQuantity(l.productId, l.quantity + 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button aria-label={`Remover ${l.name}`} className="p-2 text-muted-foreground hover:text-destructive" onClick={() => cart.remove(l.productId)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <label className="block pt-2 text-sm font-medium" htmlFor="order-note">Observação</label>
            <Textarea id="order-note" placeholder="Ex: sem cebola, ponto da carne, troco para..." value={cart.note} onChange={(e) => cart.setNote(e.target.value)} />
          </div>
        )}

        <div className="space-y-3 border-t border-border p-5">
          <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{formatBRL(cart.total)}</span></div>
          <div className="flex justify-between text-lg font-semibold"><span>Total</span><span className="text-primary">{formatBRL(cart.total)}</span></div>
          <Button variant="whatsapp" size="lg" className="w-full rounded-full font-bold uppercase tracking-wide" disabled={cart.lines.length === 0} onClick={checkout}>
            Finalizar pedido pelo WhatsApp
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
