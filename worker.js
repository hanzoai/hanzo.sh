/**
 * hanzo.sh answers one URL with two different things, and always has: the
 * landing page to a browser, the installer to `curl -fsSL hanzo.sh | sh` — the
 * command the page prints, llms.txt publishes, and every /cli /mcp /dev shim
 * re-executes.
 *
 * It used to do that by shipping a single file that was both at once: the built
 * HTML wrapped in a shell heredoc, `#!/bin/sh` on line 1. A browser cannot be
 * handed that honestly. Anything before <!DOCTYPE html> that is not whitespace
 * or a comment puts the document in quirks mode, and a shebang is neither — so
 * compatMode was BackCompat, all fifteen <head> elements (title, icons,
 * viewport, every og: and twitter: tag) were parsed into <body> where they do
 * nothing, and `#!/bin/sh <<\EOF` was the first text node on the page. No
 * arrangement of those bytes avoids it: the shell reads `<` as a redirect
 * operator, so a POSIX script cannot begin with `<!`, and only whitespace and
 * comments may precede a DOCTYPE. The trick was unfixable, not unlucky.
 *
 * So: one URL, two representations, chosen by Accept. That is what content
 * negotiation is for. curl asks for anything and gets the script; a browser
 * asks for text/html and gets a document whose first byte is `<`.
 */

const PAGE = '/page.html'
const INSTALLER = '/install.sh'

export default {
  async fetch (request, env) {
    const url = new URL(request.url)
    if (url.pathname !== '/') return env.ASSETS.fetch(request)

    const wantsPage = (request.headers.get('accept') || '').includes('text/html')
    const res = await env.ASSETS.fetch(new URL(wantsPage ? PAGE : INSTALLER, url))

    // One URL, two answers: no shared cache may keep one and hand it to the
    // other kind of client. Cloudflare only honours Vary on Accept-Encoding, so
    // say it and also refuse storage outright. no-transform is the second half:
    // the zone has Web Analytics auto-injection on, and it appends a
    // static.cloudflareinsights.com beacon to HTML that a Worker returns (it
    // leaves plain assets alone, which is why the page never carried one
    // before). This host does not ship third-party script it did not write, and
    // no-transform is the standard way to say so.
    const headers = new Headers(res.headers)
    headers.set('vary', 'accept')
    headers.set('cache-control', 'no-store, no-transform')
    return new Response(res.body, { status: res.status, headers })
  }
}
