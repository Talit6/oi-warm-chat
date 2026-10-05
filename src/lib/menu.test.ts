import { describe, expect, it } from "vitest";
import { buildOrderMessage, cartTotal, normalizeWhatsApp, whatsappUrl } from "./menu";

const lines = [
  { productId: "a", name: "Produto A", price: 12.5, quantity: 2 },
  { productId: "b", name: "Produto B", price: 0.1, quantity: 3 },
];

describe("cart", () => {
  it("totals price x quantity without float drift", () => {
    expect(cartTotal(lines)).toBe(25.3);
  });
});

describe("whatsapp", () => {
  it("adds Brazil code to the restaurant number", () => {
    expect(normalizeWhatsApp("21968869897")).toBe("5521968869897");
  });
  it("builds the order message with items, note and total", () => {
    const msg = buildOrderMessage("Restaurante Koruja's", lines, "Sem cebola");
    expect(msg).toContain("2x Produto A - R$ 25,00");
    expect(msg).toContain("Observação: Sem cebola");
    expect(msg).toContain("Total: R$ 25,30");
  });
  it("omits the note line when empty", () => {
    expect(buildOrderMessage("K", lines, "  ")).not.toContain("Observação");
  });
  it("points to wa.me with encoded text", () => {
    expect(whatsappUrl("21968869897", "Olá")).toBe("https://wa.me/5521968869897?text=Ol%C3%A1");
  });
});
