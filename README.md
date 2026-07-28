# hanzo.sh

The install surface. `curl hanzo.sh | bash` installs the Hanzo AI toolkit;
opening hanzo.sh in a browser renders the landing page. They are the same file —
see `LLM.md` for the polyglot, the installer and the serving chain.

## Stack

Vite + React 19 on **@hanzo/ui** over the **@hanzo/gui** backend, with
**@hanzo/design** tokens (monochrome, dark-default, self-hosted Geist),
**@hanzo/logo** marks via `BrandMark`, and the header/footer content from
**@hanzo/products** so this property cannot drift from the rest of the estate.
No Tailwind, no shadcn, no Radix. One route.

```bash
pnpm install
pnpm dev        # vite, :8080
pnpm build      # -> dist/, including the polyglot rewrite
pnpm typecheck
pnpm lint
```

`src/site.ts` is the page as data (install commands, bundles, per-language
packages); everything in `src/components/` renders it.
