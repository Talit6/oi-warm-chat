import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizeWhatsApp, type Settings } from "@/lib/menu";
import { ImageField } from "./ImageField";

const fields: { key: keyof Settings; label: string; multiline?: boolean; placeholder?: string }[] = [
  { key: "restaurant_name", label: "Nome do restaurante" },
  { key: "tagline", label: "Frase de destaque" },
  { key: "whatsapp", label: "WhatsApp (com DDD)", placeholder: "21968869897" },
  { key: "address", label: "Endereço", multiline: true },
  { key: "opening_hours", label: "Horário de funcionamento", multiline: true, placeholder: "Seg a Sáb: 11h às 15h" },
  { key: "instagram", label: "Instagram", placeholder: "@korujas" },
  { key: "facebook", label: "Facebook", placeholder: "korujas ou link" },
  { key: "tiktok", label: "TikTok", placeholder: "@korujas" },
  { key: "google_maps", label: "Link do Google Maps" },
  { key: "google_review_url", label: "Link para deixar avaliação no Google", placeholder: "https://g.page/r/.../review" },
  { key: "google_rating", label: "Nota no Google (0 a 5)", placeholder: "4,8" },
  { key: "google_reviews_count", label: "Quantidade de avaliações", placeholder: "120" },
];

export function SettingsTab({ settings }: { settings: Settings }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);

  async function save() {
    const whatsapp = normalizeWhatsApp(form.whatsapp);
    if (whatsapp.length < 12) return toast.error("WhatsApp inválido");
    const { id: _id, updated_at: _u, ...rest } = form;
    const toNum = (v: unknown) => (v === null || v === "" || v === undefined ? null : Number(String(v).replace(",", ".")));
    const google_rating = toNum(rest.google_rating);
    const google_reviews_count = toNum(rest.google_reviews_count);
    if (google_rating !== null && !(google_rating >= 0 && google_rating <= 5)) return toast.error("Nota deve ser entre 0 e 5");
    if (google_reviews_count !== null && !(Number.isInteger(google_reviews_count) && google_reviews_count >= 0)) return toast.error("Quantidade inválida");
    setSaving(true);
    const { error } = await supabase
      .from("restaurant_settings")
      .update({ ...rest, whatsapp, google_rating, google_reviews_count })
      .eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
    qc.invalidateQueries({ queryKey: ["menu"] });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImageField label="Logo" value={form.logo} onChange={(logo) => setForm({ ...form, logo })} />
        <ImageField label="Imagem principal" value={form.cover_image} onChange={(cover_image) => setForm({ ...form, cover_image })} />
      </div>
      {fields.map((f) => (
        <label key={f.key} className="block space-y-1">
          <span className="text-sm font-medium">{f.label}</span>
          {f.multiline ? (
            <Textarea value={String(form[f.key] ?? "")} placeholder={f.placeholder} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          ) : (
            <Input value={String(form[f.key] ?? "")} placeholder={f.placeholder} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          )}
        </label>
      ))}
      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">{saving ? "Salvando..." : "Salvar configurações"}</Button>
    </div>
  );
}
