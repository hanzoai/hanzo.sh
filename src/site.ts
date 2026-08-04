/**
 * What hanzo.sh says — as data, so the page below is only a renderer.
 *
 * The ecosystem's shared surfaces (the launcher, the footer index) come from
 * `@hanzo/products`, which is where the whole estate settles what Hanzo offers.
 * Only this property's own delta lives here.
 *
 * Every fact below belongs to `public/install.sh` and is copied from it: the
 * `TOOLS` rows, the `unavailable_rows` list, and the one command. If the
 * installer changes, this file changes with it — a page that advertises a tool
 * the installer does not fetch is the defect that installer was rewritten to
 * remove.
 */
import { MEET_HANZO_MENU, type SiteHeader } from '@hanzo/products'

/**
 * `@hanzo/products@0.2.0` does not yet know `hanzo.sh` as a `SiteId`, so the
 * install surface declares its own header against the family's contract. When
 * products adds the id, this collapses to `HEADERS['hanzo.sh']` and nothing
 * else here changes.
 */
export const HEADER: SiteHeader = {
  site: 'hanzo.ai',
  productId: 'hanzo',
  localNav: [
    { id: 'docs', label: 'Docs', href: 'https://docs.hanzo.ai' },
    { id: 'sdks', label: 'SDKs', href: 'https://hanzo.ai/sdks' },
    { id: 'pricing', label: 'Pricing', href: 'https://hanzo.ai/pricing' },
    { id: 'github', label: 'GitHub', href: 'https://github.com/hanzoai' },
  ],
  action: { label: 'Console', href: 'https://cloud.hanzo.ai' },
}

export const LAUNCHER = MEET_HANZO_MENU

/**
 * The command, and the three narrower ways to say it. `| sh`, not `| bash`: the
 * installer is POSIX and the served polyglot declares `#!/bin/sh`, so `sh` is
 * the form that is true everywhere.
 *
 * Each `path` is a real routing shim in `public/`; the default has none because
 * it IS the host.
 */
export const INSTALLS = [
  { id: 'all', label: 'Everything', path: '', cmd: 'curl -fsSL hanzo.sh | sh' },
  { id: 'cli', label: 'CLI', path: '/cli', cmd: 'curl -fsSL hanzo.sh/cli | sh' },
  { id: 'mcp', label: 'MCP', path: '/mcp', cmd: 'curl -fsSL hanzo.sh/mcp | sh' },
  { id: 'dev', label: 'Dev', path: '/dev', cmd: 'curl -fsSL hanzo.sh/dev | sh' },
] as const

/** The shortcut row: every install except the default, which is already the hero. */
export const SHORTCUTS = INSTALLS.filter((i) => i.path !== '')

export const INSTALL_NOTE =
  'One prebuilt native binary per tool, checksum-verified. No runtime, no package manager, no build step. Re-run to upgrade.'

export type Tool = {
  /** The binary's name on PATH — also the asset prefix the installer resolves. */
  bin: string
  icon: 'Cpu' | 'Code' | 'Terminal'
  desc: string
  href: string
  /** The symlinked second name, where the tool has one. */
  also?: string
}

/** `TOOLS` in `public/install.sh`, in the order the installer walks it. */
export const TOOLS: Tool[] = [
  {
    bin: 'hanzo',
    also: 'hanzo-node',
    icon: 'Cpu',
    desc: 'The Hanzo CLI — auth, billing, coding sessions, and every product of the Hanzo cloud.',
    href: 'https://github.com/hanzoai/cli',
  },
  {
    bin: 'hanzo-mcp',
    also: 'mcp',
    icon: 'Code',
    desc: 'The MCP server — the Hanzo toolset, for any MCP client.',
    href: 'https://github.com/hanzoai/mcp',
  },
  {
    bin: 'dev',
    icon: 'Terminal',
    desc: 'Hanzo Dev — the coding agent `hanzo code` runs by default.',
    href: 'https://github.com/hanzoai/dev',
  },
]

/**
 * `unavailable_rows` in `public/install.sh`. Said out loud rather than left for
 * someone to discover: an installer that quietly substitutes a package manager
 * so its list looks complete is the thing this page refuses to do.
 */
export const UNAVAILABLE = [
  { bin: 'node', why: 'source is not public yet' },
  { bin: 'desktop', why: '`hanzo desktop` is in the CLI; the standalone app is not public yet' },
  { bin: 'bot', why: '`hanzo bot` is in the CLI; the standalone node is not native yet' },
] as const

export const AFTER_INSTALL = [
  { cmd: 'hanzo auth login', desc: 'Sign in through Hanzo IAM' },
  { cmd: 'hanzo code', desc: 'Start a coding session' },
  { cmd: 'hanzo --help', desc: 'Every command' },
  { cmd: 'hanzo-mcp', desc: 'Run the MCP server' },
] as const

export type Resource = {
  id: string
  label: string
  href: string
  icon: 'BookOpen' | 'Github' | 'Zap'
  /** The one filled action. */
  primary?: boolean
}

export const RESOURCES: Resource[] = [
  { id: 'docs', label: 'Documentation', href: 'https://docs.hanzo.ai', icon: 'BookOpen', primary: true },
  { id: 'python-sdk', label: 'Python SDK', href: 'https://github.com/hanzoai/python-sdk', icon: 'Github' },
  { id: 'js-sdk', label: 'JS SDK', href: 'https://github.com/hanzoai/js-sdk', icon: 'Github' },
  { id: 'hanzo-ai', label: 'hanzo.ai', href: 'https://hanzo.ai', icon: 'Zap' },
]

export const FOOTER_TAGLINE =
  'One command installs the Hanzo CLI, the MCP server and the coding agent as native binaries — checksum-verified, nothing to build.'
