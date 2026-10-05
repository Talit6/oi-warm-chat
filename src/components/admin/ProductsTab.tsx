import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatBRL, type Category, type Product } from "@/lib/menu";
import { ImageField } from "./ImageField";

type Draft = Omit<Product, "id" | "created_at" | "updated_at"> & { id?: string };
const empty = (catId: string | null): Draft => ({ name: "", description: "", price: 0, image: null, available: true, featured: false, category_id: catId });

export function ProductsTab({ products, categories }: { products: Product[]; categories: Category[] }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["menu"] });

  async function save() {
    if (!draft) return;
    if (!draft.name.trim()) return toast.error("Informe o nome");
    if (!(Number(draft.price) >= 0)) return toast.error("Preço inválido");
    setSaving(true);
    const { id, ...row } = draft;
    const payload = { ...row, name: row.name.trim(), price: Number(row.price) };
    const res = id ? await supabase.from("products").update(payload).eq("id", id) : await supabase.from("products").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Produto salvo");
    setDraft(null);
    refresh();
  }

  async function patch(id: string, values: Partial<Product>) {
    const { error } = await supabase.from("products").update(values).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  }

  async function del(p: Product) {
    if (!confirm(`Excluir "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); refresh(); }
  }

  return (
    <div className="space-y-3">
      <Button onClick={() => setDraft(empty(categories[0]?.id ?? null))} className="rounded-full"><Plus className="h-4 w-4" /> Novo produto</Button>
      {products.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
          {p.image ? <img src={p.image} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <div className="h-14 w-14 rounded-lg bg-muted" />}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{p.name}</p>
            <p className="text-sm text-muted-foreground">{categories.find((c) => c.id === p.category_id)?.name ?? "Sem categoria"} · {formatBRL(Number(p.price))}</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">Disponível<Switch checked={p.available} onCheckedChange={(v) => patch(p.id, { available: v })} /></label>
          <button aria-label="Destaque" onClick={() => patch(p.id, { featured: !p.featured })} className={p.featured ? "text-primary" : "text-muted-foreground"}><Star className="h-5 w-5" fill={p.featured ? "currentColor" : "none"} /></button>
          <button aria-label="Editar" onClick={() => setDraft({ ...p })}><Pencil className="h-4 w-4" /></button>
          <button aria-label="Excluir" onClick={() => del(p)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogTitle>{draft?.id ? "Editar produto" : "Novo produto"}</DialogTitle>
          {draft && (
            <div className="space-y-4">
              <ImageField label="Foto" value={draft.image} onChange={(image) => setDraft({ ...draft, image })} />
              <Input placeholder="Nome" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <Textarea placeholder="Descrição" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <Input type="number" step="0.01" min="0" placeholder="Preço" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.category_id ?? ""} onChange={(e) => setDraft({ ...draft, category_id: e.target.value || null })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label className="flex items-center justify-between text-sm">Disponível<Switch checked={draft.available} onCheckedChange={(available) => setDraft({ ...draft, available })} /></label>
              <label className="flex items-center justify-between text-sm">Destaque<Switch checked={draft.featured} onCheckedChange={(featured) => setDraft({ ...draft, featured })} /></label>
              <Button className="w-full" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
