import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, MessageCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import heroImg from "@/assets/hero.jpg";
import logoAsset from "@/assets/koruja-logo.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/menu/ProductCard";
import { ProductDialog } from "@/components/menu/ProductDialog";
import { CartSheet } from "@/components/menu/CartSheet";
import { SocialReviews } from "@/components/menu/SocialReviews";
import { InfoSection } from "@/components/menu/InfoSection";
import { useCart } from "@/lib/cart";
import { formatBRL, menuQuery, whatsappUrl, type Product } from "@/lib/menu";

const TITLE = "Restaurante Koruja's | Cardápio Digital";
const DESC = "Confira o cardápio digital do Restaurante Koruja's: pratos, refeições, lanches, porções, bebidas e sobremesas. Monte seu pedido e envie pelo WhatsApp.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { data, isLoading, error } = useQuery(menuQuery);
  const cart = useCart();
  const [selected, setSelected] = useState<Product | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const settings = data?.settings;
  const name = settings?.restaurant_name ?? "Restaurante Koruja's";
  const phone = settings?.whatsapp ?? "5521968869897";

  const sections = useMemo(
    () =>
      (data?.categories ?? [])
        .map((c) => ({ category: c, products: (data?.products ?? []).filter((p) => p.category_id === c.id) }))
        .filter((s) => s.products.length > 0),
    [data],
  );

  useEffect(() => {
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.find((e) => e.isIntersecting);
        if (vis) setActive(vis.target.id.replace("cat-", ""));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(`cat-${s.category.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  function add(p: Product, qty = 1) {
    cart.add(p, qty);
    setSelected(null);
    toast.success(`${qty}x ${p.name} adicionado`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="relative isolate overflow-hidden">
        <img src={settings?.cover_image || heroImg} alt="Pratos do restaurante" width={1600} height={1008} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-fade" />
        <div className="mx-auto flex min-h-[62vh] max-w-5xl flex-col justify-end px-4 pb-10 pt-24 animate-fade-up">
          <img src={settings?.logo || logoAsset.url} alt={`Logo ${name}`} width={112} height={112} className="mb-5 h-24 w-24 rounded-full border-2 border-primary object-cover shadow-glow sm:h-28 sm:w-28" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Cardápio digital</p>
          <h1 className="mt-2 text-4xl font-semibold leading-[1.05] sm:text-6xl">{name}</h1>
          <p className="mt-3 max-w-md text-lg text-muted-foreground">{settings?.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="whatsapp" size="lg" className="h-12 w-fit rounded-full px-6 font-semibold">
              <a href={whatsappUrl(phone, `Olá! Vim pelo cardápio do ${name}.`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" /> Pedir pelo WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 w-fit rounded-full px-6 font-semibold">
              <a href="https://www.instagram.com/restaurante_korujas?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" /> Instagram
              </a>
            </Button>
          </div>
        </div>
      </header>

      <nav aria-label="Categorias" className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <ul className="scrollbar-none mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3">
          {sections.map(({ category }) => (
            <li key={category.id} className="shrink-0">
              <a
                href={`#cat-${category.id}`}
                className={`block rounded-full border px-4 py-2 text-sm font-medium transition ${active === category.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="mx-auto max-w-5xl px-4 pt-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        )}
        {error && <p className="py-10 text-center text-muted-foreground">Não foi possível carregar o cardápio. Tente novamente.</p>}
        {sections.map(({ category, products }) => (
          <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-20 py-6">
            <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">{category.name}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {products.map((p) => <ProductCard key={p.id} product={p} onOpen={setSelected} onAdd={(x) => add(x)} />)}
            </div>
          </section>
        ))}
      </main>

      {settings && <SocialReviews settings={settings} />}
      {settings && <InfoSection settings={settings} />}

      <footer className="pb-28 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {name} · <Link to="/admin" className="hover:text-primary">Área do restaurante</Link>
      </footer>

      {cart.count > 0 && (
        <button
          type="button"
          onClick={() => cart.setOpen(true)}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center justify-between rounded-full bg-gold px-5 py-4 font-semibold text-primary-foreground shadow-glow animate-fade-up"
        >
          <span className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Ver pedido ({cart.count})</span>
          <span>{formatBRL(cart.total)}</span>
        </button>
      )}

      <ProductDialog
        product={selected}
        categoryName={data?.categories.find((c) => c.id === selected?.category_id)?.name}
        onClose={() => setSelected(null)}
        onAdd={add}
      />
      <CartSheet restaurant={name} whatsapp={phone} />
    </div>
  );
}
