/**
 * Menu domain: types, data access (browser client, RLS-enforced) and pure helpers.
 */
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type Settings = Tables<"restaurant_settings">;

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MenuData {
  categories: Category[];
  products: Product[];
  settings: Settings | null;
}

export async function fetchMenu(): Promise<MenuData> {
  const [c, p, s] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("products").select("*").order("featured", { ascending: false }).order("name"),
    supabase.from("restaurant_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (c.error) throw c.error;
  if (p.error) throw p.error;
  if (s.error) throw s.error;
  return { categories: c.data, products: p.data, settings: s.data };
}

export const menuQuery = queryOptions({
  queryKey: ["menu"],
  queryFn: fetchMenu,
  staleTime: 60_000,
});

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
/** Formats a number as Brazilian Real, e.g. 12.5 -> "R$ 12,50". */
export function formatBRL(value: number): string {
  return brl.format(value).replace(/\u00a0/g, " ");
}

/** Sum of price * quantity, rounded to cents. */
export function cartTotal(lines: CartLine[]): number {
  const cents = lines.reduce((acc, l) => acc + Math.round(l.price * 100) * l.quantity, 0);
  return cents / 100;
}

/** Keeps only digits; prefixes Brazil code 55 when a local number (10–11 digits) is given. */
export function normalizeWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function buildOrderMessage(restaurant: string, lines: CartLine[], note: string): string {
  const items = lines
    .map((l) => `${l.quantity}x ${l.name} - ${formatBRL(l.price * l.quantity)}`)
    .join("\n");
  const parts = [`Olá! Gostaria de fazer um pedido no ${restaurant}.`, "", "Pedido:", items];
  if (note.trim()) parts.push("", `Observação: ${note.trim()}`);
  parts.push("", `Total: ${formatBRL(cartTotal(lines))}`);
  return parts.join("\n");
}

export function whatsappUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${normalizeWhatsApp(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Uploads an image to private storage and returns a long-lived signed URL (10 years). */
export async function uploadMenuImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("menu").upload(path, file, { contentType: file.type });
  if (up.error) throw up.error;
  const signed = await supabase.storage.from("menu").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signed.error || !signed.data) throw signed.error ?? new Error("Falha ao gerar link da imagem");
  return signed.data.signedUrl;
}
