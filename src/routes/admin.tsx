import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { menuQuery } from "@/lib/menu";
import { ProductsTab } from "@/components/admin/ProductsTab";
import { CategoriesTab } from "@/components/admin/CategoriesTab";
import { SettingsTab } from "@/components/admin/SettingsTab";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel administrativo | Restaurante Koruja's" },
      { name: "description", content: "Gerencie produtos, categorias e configurações do cardápio digital." },
      { property: "og:title", content: "Painel administrativo | Restaurante Koruja's" },
      { property: "og:description", content: "Área restrita do restaurante." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("claim_admin").then(({ data, error }) => setIsAdmin(!error && data === true));
  }, [session]);

  if (!ready) return null;
  if (!session) return <AuthForm />;
  if (isAdmin === null) return <Centered>Verificando acesso...</Centered>;
  if (!isAdmin)
    return (
      <Centered>
        <p>Esta conta não tem acesso ao painel.</p>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sair</Button>
      </Centered>
    );
  return <Dashboard />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">{children}</div>;
}

function AuthForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("E-mail ou senha incorretos");
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      if (error) toast.error(error.message);
      else toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail e depois entre.");
    }
    setBusy(false);
  }

  return (
    <Centered>
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 text-left">
        <h1 className="text-3xl font-semibold">Área do restaurante</h1>
        <p className="text-sm text-muted-foreground">{mode === "in" ? "Entre para gerenciar o cardápio." : "Crie sua conta de administrador."}</p>
        <Input type="email" required placeholder="E-mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={6} placeholder="Senha" autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Aguarde..." : mode === "in" ? "Entrar" : "Criar conta"}</Button>
        <button type="button" className="w-full text-sm text-muted-foreground hover:text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-primary">← Voltar ao cardápio</Link>
      </form>
    </Centered>
  );
}

function Dashboard() {
  const { data, isLoading } = useQuery(menuQuery);
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    await supabase.auth.signOut();
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Painel</h1>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Ver cardápio →</Link>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /> Sair</Button>
      </div>
      {isLoading || !data ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <Tabs defaultValue="products">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          <TabsContent value="products"><ProductsTab products={data.products} categories={data.categories} /></TabsContent>
          <TabsContent value="categories"><CategoriesTab categories={data.categories} /></TabsContent>
          <TabsContent value="settings">{data.settings && <SettingsTab settings={data.settings} />}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
