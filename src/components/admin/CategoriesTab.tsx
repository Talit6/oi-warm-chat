import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/menu";

export function CategoriesTab({ categories }: { categories: Category[] }) {
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["menu"] });

  async function create() {
    if (!newName.trim()) return;
    const order = Math.max(0, ...categories.map((c) => c.sort_order)) + 1;
    const { error } = await supabase.from("categories").insert({ name: newName.trim(), sort_order: order });
    if (error) return toast.error(error.message);
    setNewName("");
    refresh();
  }

  async function rename() {
    if (!editing?.name.trim()) return;
    const { error } = await supabase.from("categories").update({ name: editing.name.trim() }).eq("id", editing.id);
    if (error) return toast.error(error.message);
    setEditing(null);
    refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const a = categories[index];
    const b = categories[index + dir];
    if (!a || !b) return;
    const r = await Promise.all([
      supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("categories").update({ sort_order: a.sort_order === b.sort_order ? a.sort_order + dir : a.sort_order }).eq("id", b.id),
    ]);
    const err = r.find((x) => x.error)?.error;
    if (err) toast.error(err.message);
    refresh();
  }

  async function del(c: Category) {
    if (!confirm(`Excluir "${c.name}"? Os produtos desta categoria também serão excluídos.`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) toast.error(error.message); else refresh();
  }

  return (
    <div className="space-y-3">
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); create(); }}>
        <Input placeholder="Nova categoria" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Button type="submit"><Plus className="h-4 w-4" /> Criar</Button>
      </form>
      {categories.map((c, i) => (
        <div key={c.id} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
          <div className="flex flex-col">
            <button aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)} className="disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
            <button aria-label="Descer" disabled={i === categories.length - 1} onClick={() => move(i, 1)} className="disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
          </div>
          {editing?.id === c.id ? (
            <>
              <Input value={editing.name} onChange={(e) => setEditing({ id: c.id, name: e.target.value })} autoFocus />
              <button aria-label="Salvar" onClick={rename}><Check className="h-4 w-4 text-success" /></button>
            </>
          ) : (
            <>
              <span className="flex-1 font-medium">{c.name}</span>
              <button aria-label="Editar" onClick={() => setEditing({ id: c.id, name: c.name })}><Pencil className="h-4 w-4" /></button>
            </>
          )}
          <button aria-label="Excluir" onClick={() => del(c)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}
