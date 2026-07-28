/**
 * What hanzo.sh says — as data, so the page below is only a renderer.
 *
 * The ecosystem's shared surfaces (the launcher, the footer index) come from
 * `@hanzo/products`, which is where the whole estate settles what Hanzo offers.
 * Only this property's own delta lives here: the install commands, the bundles
 * and the packages each language ships — facts that belong to the installer
 * (`public/install.sh`) and to nothing else.
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

/** The three headline pipes, the tab strip over the one command row. */
export const INSTALLS = [
  { id: 'curl', label: 'Default', cmd: 'curl -fsSL hanzo.sh | bash' },
  { id: 'curl-full', label: 'Full', cmd: 'curl -fsSL hanzo.sh | bash -s -- --bundle full' },
  { id: 'curl-rust', label: 'Rust', cmd: 'curl -fsSL hanzo.sh | bash -s -- --bundle rust' },
] as const

/** The per-bundle shims served out of `public/` — each is a real path on this host. */
export const SHORTCUTS = [
  { path: '/dev', label: 'Dev Agent' },
  { path: '/mcp', label: 'MCP Server' },
  { path: '/cli', label: 'CLI Only' },
  { path: '/python', label: 'Python Bundle' },
  { path: '/rust', label: 'Rust Bundle' },
] as const

export const PACKAGE_MANAGERS = [
  { id: 'pip', cmd: 'pip install hanzo' },
  { id: 'uvx', cmd: 'uvx hanzo' },
  { id: 'cargo', cmd: 'cargo install hanzo-dev' },
  { id: 'npm', cmd: 'npm i -g @hanzoai/cli' },
] as const

export type Language = {
  id: string
  name: string
  icon: 'Code' | 'Cpu' | 'Globe'
  registry: { label: string; href: string }
  packages: { pkg: string; desc: string }[]
}

export const LANGUAGES: Language[] = [
  {
    id: 'python',
    name: 'Python',
    icon: 'Code',
    registry: { label: 'PyPI', href: 'https://pypi.org/project/hanzo/' },
    packages: [
      { pkg: 'hanzo', desc: 'CLI & cloud' },
      { pkg: 'hanzo-mcp', desc: 'MCP server' },
      { pkg: 'hanzo-agents', desc: 'Multi-agent framework' },
      { pkg: 'hanzoai', desc: 'API client SDK' },
    ],
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: 'Cpu',
    registry: { label: 'GitHub', href: 'https://github.com/hanzoai/node' },
    packages: [
      { pkg: 'hanzo-node', desc: 'Compute node' },
      { pkg: 'hanzo-dev', desc: 'Coding agent' },
      { pkg: 'hanzo-mcp', desc: 'Fast MCP' },
    ],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: 'Globe',
    registry: { label: 'npm', href: 'https://www.npmjs.com/org/hanzoai' },
    packages: [
      { pkg: '@hanzoai/cli', desc: 'CLI' },
      { pkg: '@hanzoai/sdk', desc: 'API client' },
      { pkg: '@hanzoai/mcp', desc: 'MCP client' },
    ],
  },
]

export type Bundle = {
  /** The `--bundle` value. */
  name: string
  desc: string
  /** Pill beside the name: which one is the default, which one is advised. */
  note?: string
  /** Draw the card's border brighter — one bundle at most. */
  emphasis?: boolean
}

export const BUNDLES: Bundle[] = [
  { name: 'minimal', desc: 'CLI only', note: 'default' },
  { name: 'python', desc: 'CLI + MCP + agents' },
  { name: 'rust', desc: 'High-perf binaries' },
  { name: 'full', desc: 'Everything', note: 'recommended', emphasis: true },
]

export const AFTER_INSTALL = [
  { cmd: 'hanzo --help', desc: 'Show all commands' },
  { cmd: 'hanzo auth login', desc: 'Authenticate with Hanzo Cloud' },
  { cmd: 'hanzo dev', desc: 'Start AI coding session' },
  { cmd: 'hanzo-mcp', desc: 'Run MCP server for Claude/IDEs' },
] as const

export type Feature = { icon: 'Code' | 'Database' | 'Bot' | 'Share2'; title: string; description: string }

export const FEATURES_TITLE = 'Accelerate Development with AI'

export const FEATURES_BLURB =
  "Integrate powerful AI tools into your development workflow. From smart code suggestions to automated testing, Hanzo's AI-powered platform helps you build better applications faster."

export const FEATURES: Feature[] = [
  {
    icon: 'Code',
    title: 'Hanzo Code & App Builder',
    description: 'Build applications faster with our AI-powered code editor and visual app builder',
  },
  {
    icon: 'Database',
    title: 'Hanzo Analytics & Base',
    description: 'Enterprise-ready infrastructure with real-time analytics and monitoring',
  },
  {
    icon: 'Bot',
    title: 'Hanzo Dev AI Team',
    description: 'Your AI development team that helps write, review, and optimize code',
  },
  {
    icon: 'Share2',
    title: 'Open Source & Extensible',
    description: 'Built on open source technologies and designed for unlimited customization',
  },
]

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
  'One command installs the Hanzo AI toolkit — CLI, MCP server, agents and SDKs, in Python, Rust or JavaScript.'
