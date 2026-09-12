const VARIABLES = [
  "NEXT_PUBLIC_SUPABASE_URL=",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
  "ANTHROPIC_API_KEY=",
].join("\n");

/** Shown instead of the queue until app/web/.env.local exists. */
export function SinConfiguracion() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-4 px-6">
      <h1 className="text-xl font-semibold">Falta configurar el panel</h1>
      <p className="text-muted-foreground text-sm">
        Creá <code className="font-mono">app/web/.env.local</code> con estas variables y reiniciá el
        servidor. La key de Anthropic la usa Modificar.
      </p>
      <pre className="bg-muted overflow-x-auto rounded-md p-3 font-mono text-sm">{VARIABLES}</pre>
    </main>
  );
}
