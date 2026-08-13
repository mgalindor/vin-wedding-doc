'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const nunjucks = require('nunjucks');

// ---------------------------------------------------------------------------
// Paths — DESIGN.md path can be passed as first CLI argument
// ---------------------------------------------------------------------------
const DESIGN_MD  = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(__dirname, '../../../2-product/2.1-discovery/2.1.6-design/DESIGN.md');
const OUTPUT_DIR   = path.dirname(DESIGN_MD);
const OUTPUT_BASE  = path.basename(DESIGN_MD, path.extname(DESIGN_MD)).toLowerCase() + '-preview';
const TEMPLATES    = path.join(__dirname, 'templates');

// ---------------------------------------------------------------------------
// Parse DESIGN.md frontmatter and body (gray-matter + js-yaml under the hood)
// ---------------------------------------------------------------------------
const { data: tokens, content: markdownBody } = matter(fs.readFileSync(DESIGN_MD, 'utf8'));

// Convert inline markdown (**bold**, `code`) to HTML
function mdInline(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Extract Do's & Don'ts bullet lists from the markdown body
function parseDosDonts(body) {
  const section = body.match(/##\s+Do.s and Don.ts([\s\S]*?)(?=\n## |\s*$)/i)?.[1] ?? '';
  function bullets(subsection) {
    return (subsection ?? '').match(/^- .+$/gm)
      ?.map(l => mdInline(
        l.replace(/^- /, '')
         .replace(/^\*\*Don't\*\*\s*/i, '')
         .replace(/^\*\*Do\*\*\s*/i, '')
         .trim()
      )) ?? [];
  }
  return {
    dos:   bullets(section.match(/###\s+Do.s([\s\S]*?)(?=\n### |\s*$)/i)?.[1]),
    donts: bullets(section.match(/###\s+Don.ts([\s\S]*?)(?=\n### |\s*$)/i)?.[1]),
  };
}

const dosDonts = parseDosDonts(markdownBody);

// Resolve {section.key} references inside component spec values
function resolveRef(value, data) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    const parts = ref.split('.');
    let cur = data;
    for (const p of parts) cur = cur?.[p];
    return typeof cur === 'string' ? cur : value;
  });
}

for (const props of Object.values(tokens.components || {})) {
  for (const [k, v] of Object.entries(props)) {
    props[k] = resolveRef(v, tokens);
  }
}

// ---------------------------------------------------------------------------
// Color groups — built dynamically from whatever keys exist in tokens.colors
// ---------------------------------------------------------------------------
const colorGroups = (() => {
  // Classify each color key into a semantic bucket
  const buckets = {};
  for (const [key, value] of Object.entries(tokens.colors || {})) {
    let bucket;
    if (/^(primary|on-primary|inverse-primary|primary-fixed|on-primary-fixed)/.test(key)) bucket = 'Primary';
    else if (/^(secondary|on-secondary|secondary-fixed|on-secondary-fixed)/.test(key)) bucket = 'Secondary';
    else if (/^(tertiary|on-tertiary|tertiary-fixed|on-tertiary-fixed)/.test(key)) bucket = 'Tertiary';
    else if (/^(surface|canvas|on-surface|inverse-surface)/.test(key)) bucket = 'Surfaces';
    else if (/^(outline|hairline|divider|border)/.test(key)) bucket = 'Outlines';
    else if (/^(status|error|success|warning)/.test(key)) bucket = 'Status';
    else if (/^(green|magenta|link|accent|cyan|violet)/.test(key)) bucket = 'Accents';
    else bucket = 'Other';
    if (!buckets[bucket]) buckets[bucket] = [];
    buckets[bucket].push({ name: key, value });
  }
  const ORDER = ['Primary', 'Secondary', 'Tertiary', 'Accents', 'Surfaces', 'Outlines', 'Status', 'Other'];
  return ORDER.filter(b => buckets[b]).map(b => ({ title: b, swatches: buckets[b] }));
})();

// ---------------------------------------------------------------------------
// Rounded entries — add pixel equivalents and usage notes
// ---------------------------------------------------------------------------
const ROUNDED_USAGE = {
  sm:   'checkboxes, chips',
  base: 'buttons, inputs',
  md:   'secondary cards',
  lg:   'dashboard cards',
  xl:   'invitation modules',
  full: 'badges, avatars',
};

const roundedEntries = Object.entries(tokens.rounded).map(([name, value]) => {
  const v = String(value);
  const px = v.endsWith('rem') ? Math.round(parseFloat(v) * 16) + 'px' : v;
  return { name, value: v, px, usage: ROUNDED_USAGE[name] || '' };
});

// ---------------------------------------------------------------------------
// Typography entries — format spec strings and sample text for the preview
// ---------------------------------------------------------------------------
const TYPE_SAMPLES = {
  'display-lg':       'Aa',
  'display-lg-mobile':'Aa',
  'headline-md':      'Project Overview — Q3 2026',
  'headline-sm':      'Section Title',
  'body-lg':          'We are glad to have you here. Please review the details below.',
  'body-md':          'Please confirm your details before September 1st.',
  'body-sm':          'Location: Main Conference Room · 10:00 AM',
  'label-caps':       'Records · Add Item · Status',
  'data-tabular':     '142 records · 98 active · 2026-09-15',
};

const typographyEntries = Object.entries(tokens.typography).map(([name, spec]) => {
  const specLines = [
    `${spec.fontFamily} ${spec.fontWeight}`,
    `${spec.fontSize} / ${spec.lineHeight}`,
    ...(spec.letterSpacing ? [spec.letterSpacing] : []),
  ];
  return {
    name,
    cssClass: `t-${name}`,
    specHtml: specLines.join('<br/>'),
    sample: TYPE_SAMPLES[name] || 'Sample',
    uppercase:  name === 'label-caps',
    tabularNums: name === 'data-tabular',
  };
});

// ---------------------------------------------------------------------------
// Font stack resolution — maps design system font families to web-safe stacks
// and discovers the Google Fonts import URL
// ---------------------------------------------------------------------------
const FONT_ENTRIES = [
  { match: f => /abc ginto|ggsans|discord/i.test(f),   stack: `'Inter', sans-serif`,          google: `Inter:ital,wght@0,400;0,500;0,600;0,700;0,800` },
  { match: f => /playfair/i.test(f),                    stack: `'Playfair Display', serif`,     google: `Playfair+Display:ital,wght@0,600;0,700;1,600` },
  { match: f => /space grotesk/i.test(f),               stack: `'Space Grotesk', sans-serif`,   google: `Space+Grotesk:wght@400;500;600;700` },
  { match: f => /hanken grotesk/i.test(f),              stack: `'Hanken Grotesk', sans-serif`,  google: `Hanken+Grotesk:wght@400;500;600;700;800` },
  { match: f => /plus jakarta/i.test(f),                stack: `'Plus Jakarta Sans', sans-serif`, google: `Plus+Jakarta+Sans:wght@400;500;600;700;800` },
  { match: f => /inter/i.test(f),                       stack: `'Inter', sans-serif`,           google: `Inter:ital,wght@0,400;0,500;0,600;0,700;0,800` },
];

function resolveFontStack(family) {
  if (!family) return { stack: `sans-serif`, google: null };
  for (const e of FONT_ENTRIES) {
    if (e.match(family)) return e;
  }
  const clean = family.trim();
  return { stack: clean.includes(' ') ? `'${clean}', sans-serif` : `${clean}, sans-serif`, google: null };
}

// Collect unique Google Font families from all typography tokens
const googleFontFamilies = new Set();
for (const spec of Object.values(tokens.typography || {})) {
  const { google } = resolveFontStack(spec.fontFamily);
  if (google) googleFontFamilies.add(google);
}
const googleFontsUrl = googleFontFamilies.size
  ? `https://fonts.googleapis.com/css2?${[...googleFontFamilies].map(f => `family=${f}`).join('&')}&display=swap`
  : null;

// ---------------------------------------------------------------------------
// Semantic aliases — map actual token names → generic names used in CSS template
// Emits a warning for each alias that cannot be derived from existing tokens.
// ---------------------------------------------------------------------------
function buildSemanticAliases(colors, rounded) {
  const c = colors || {};
  const r = rounded || {};
  const missing = [];
  const aliases = {};

  function pick(...keys) {
    for (const k of keys) if (c[k]) return c[k];
    return null;
  }

  function map(aliasName, ...tryKeys) {
    if (c[aliasName]) return;           // token exists directly, no alias needed
    const val = pick(...tryKeys);
    if (val) {
      aliases[aliasName] = val;
    } else {
      missing.push(`${aliasName}  (looked for: ${tryKeys.join(', ')})`);
    }
  }

  // Surfaces
  map('surface',                   'canvas', 'surface');
  map('on-surface',                'ink', 'on-surface');
  map('on-surface-variant',        'muted', 'on-surface-variant');
  map('surface-container-lowest',  'surface-indigo', 'surface-container-lowest');
  map('surface-container-low',     'surface-onyx', 'surface-container-low');
  map('surface-container',         'surface-container');
  map('surface-container-high',    'surface-container-high');
  map('surface-container-highest', 'surface-container-highest');
  map('inverse-surface',           'surface-black', 'inverse-surface');

  // Outlines
  map('outline-variant', 'hairline', 'outline-variant');
  map('outline',         'outline', 'hairline');

  // Secondary (muted text / ghost fills)
  map('secondary',                  'muted', 'secondary');
  map('secondary-container',        'surface-indigo', 'secondary-container');
  map('on-secondary-fixed-variant', 'ink', 'on-secondary-fixed-variant');
  map('secondary-fixed',            'surface-indigo', 'secondary-fixed');
  map('secondary-fixed-dim',        'surface-indigo', 'secondary-fixed-dim');

  // Tertiary (accent — e.g. magenta for Discord)
  map('tertiary',                  'magenta', 'tertiary');
  map('on-tertiary',               'ink-dark', 'on-tertiary');
  map('tertiary-container',        'magenta', 'tertiary-container');
  map('on-tertiary-container',     'ink-dark', 'on-tertiary-container');
  map('tertiary-fixed',            'magenta', 'tertiary-fixed');
  map('on-tertiary-fixed-variant', 'ink-dark', 'on-tertiary-fixed-variant');
  map('tertiary-fixed-dim',        'magenta', 'tertiary-fixed-dim');

  // Primary containers (hover states)
  map('primary-container',        'primary-container', 'primary');
  map('on-primary-container',     'on-primary-container', 'on-primary');
  map('inverse-primary',          'on-primary', 'inverse-primary');
  map('primary-fixed',            'primary-fixed', 'primary');
  map('on-primary-fixed-variant', 'on-primary', 'on-primary-fixed-variant');

  // Error / status
  map('error',              'error');
  map('error-container',    'error-container');
  map('on-error-container', 'on-error-container');

  // Status pips — confirmed maps to green if present
  map('status-confirmed-bg',   'status-confirmed-bg', 'green');
  map('status-confirmed-text', 'status-confirmed-text', 'ink-dark');
  map('status-pending-bg',     'status-pending-bg');
  map('status-pending-text',   'status-pending-text');

  // Rounded base — sm preferred, then base, then first available
  const roundedBase = r['sm'] || r['base'] || Object.values(r).find(Boolean);
  if (roundedBase) {
    if (!r['base']) aliases['rounded-base'] = String(roundedBase); // only alias if 'base' missing
  } else {
    missing.push('rounded-base  (looked for: rounded.sm, rounded.base)');
  }

  return { aliases, missing };
}

const { aliases: semanticAliases, missing: missingAliases } = buildSemanticAliases(tokens.colors, tokens.rounded);

if (missingAliases.length) {
  console.warn('\n\u26a0  Missing semantic alias mappings (tokens not in design spec):');
  for (const m of missingAliases) console.warn(`   \u2013 ${m}`);
  console.warn('');
}

// ---------------------------------------------------------------------------
// Parse elevation shadows from the markdown body
// ---------------------------------------------------------------------------
function parseElevationShadows(body) {
  const section = body.match(/##\s+Elevation.*?Depth([\s\S]*?)(?=\n## |\s*$)/i)?.[1] ?? '';
  const shadows = {};
  // Capture patterns like "shadow: 0 3px 68px rgba(...)" or backtick-wrapped shadow values
  const matches = [...section.matchAll(/`([^`]*(?:box-shadow|0\s+\d+px)[^`]*)`|shadow[^`\n:]*:\s*`([^`]+)`/gi)];
  let idx = 1;
  for (const m of matches) {
    const val = (m[1] || m[2] || '').trim();
    if (val && /\d+px/.test(val)) {
      shadows[`shadow-${idx}`] = val;
      idx++;
    }
  }
  return shadows;
}

const elevationShadows = parseElevationShadows(markdownBody);

// ---------------------------------------------------------------------------
// Component cards — rendered from tokens.components for the "Components" section
// ---------------------------------------------------------------------------
const COMP_HINTS = {
  'button-primary':  { subtitle: 'primary CTA',   label: 'Open Discord', desc: 'Brand fill, white label — the everyday action button.' },
  'button-green':    { subtitle: 'high-intent',    label: 'Download',     desc: 'Electric green, black label — the single highest-intent action.' },
  'button-white':    { subtitle: 'white solid',    label: 'Login',        desc: 'White fill, dark label — secondary nav CTA.' },
  'button-ghost':    { subtitle: 'translucent',    label: 'Learn more',   desc: 'Raised-surface fill, white text — subtle dark-surface CTA.' },
  'button-ghost-sm': { subtitle: 'compact ghost',  label: 'View',         desc: 'Compact variant for secondary/quest actions.' },
  'badge':           { subtitle: 'tag chip',       label: 'New',          desc: 'Accent pill — category chip and promotional badge.' },
  'nav-bar':         { subtitle: 'navigation',     label: null,           desc: 'Top navigation bar with logo, links, and CTA.' },
  'hero':            { subtitle: 'hero section',   label: null,           desc: 'Full-width hero with gradient mesh and all-caps headline.' },
  'feature-card-gradient': { subtitle: 'gradient card', label: null,      desc: 'Vibrant accent gradient feature panel.' },
  'feature-card-dark':     { subtitle: 'dark card',     label: null,      desc: 'Raised dark surface feature card.' },
  'cta-band':        { subtitle: 'CTA band',       label: null,           desc: 'Full-bleed brand-color band with headline and CTA.' },
  'stat-card':       { subtitle: 'stat',           label: '150M+',        desc: 'Big-number stat card.' },
  'step-card':       { subtitle: 'step',           label: 'Step 1',       desc: 'Numbered process step panel.' },
  'pricing-table':   { subtitle: 'pricing',        label: null,           desc: 'Plan comparison table card.' },
};

const BUTTON_LIKE = new Set(['button-primary', 'button-green', 'button-white', 'button-ghost', 'button-ghost-sm']);
const BADGE_LIKE  = new Set(['badge']);

function renderCompPreview(name, spec) {
  const hint = COMP_HINTS[name] || {};
  const label = hint.label || 'Sample';
  const bg     = spec.backgroundColor || 'transparent';
  const color  = spec.textColor || 'inherit';
  const radius = spec.rounded || '8px';
  const pad    = spec.padding || '12px 20px';

  if (BADGE_LIKE.has(name)) {
    return `<span style="display:inline-block;background:${bg};color:${color};border-radius:${radius};padding:${pad};font-weight:700;font-size:14px;">${label}</span>`;
  }
  if (BUTTON_LIKE.has(name)) {
    const border = name.includes('white') ? `1px solid #e0e0e0` : 'none';
    return `<button style="background:${bg};color:${color};border-radius:${radius};padding:${pad};border:${border};font-weight:700;font-size:16px;cursor:pointer;display:inline-block;line-height:1.2;">${label}</button>`;
  }
  // Generic card preview
  return `<div style="background:${bg};color:${color};border-radius:min(${radius},16px);padding:16px 20px;font-weight:700;font-size:14px;min-width:120px;display:inline-block;">${label}</div>`;
}

const componentCards = Object.entries(tokens.components || {})
  .filter(([name]) => !name.startsWith('ex-'))
  .map(([name, spec]) => {
    const hint = COMP_HINTS[name] || {};
    return {
      name,
      subtitle: hint.subtitle || '',
      previewHtml: renderCompPreview(name, spec),
      desc: hint.desc || '',
      spec,
    };
  });

// ---------------------------------------------------------------------------
// Responsive breakpoints — parsed from the markdown body
// ---------------------------------------------------------------------------
function parseResponsive(body) {
  const bpSection = body.match(/####\s+Breakpoints([\s\S]*?)(?=\n####\s|\n###\s|\n##\s|\s*$)/i)?.[1] ?? '';
  const rows = [...bpSection.matchAll(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/gm)]
    .filter(m => !/^[-\s|]+$/.test(m[0]) && !/name/i.test(m[1]))
    .map(m => ({ name: m[1].trim(), width: m[2].trim(), changes: mdInline(m[3].trim()) }));

  // Build proportional bands for the ruler
  const MAX_PX = 1500;
  const bands = rows.map((row, i) => {
    const w = row.width;
    let startPx, displayPx;
    if (/^</.test(w)) {
      // "< 768px" — range starts at 0, display the upper bound
      const m = w.match(/(\d{3,4})/);
      startPx = 0;
      displayPx = m ? `< ${m[1]}px` : w;
    } else if (/[–\-]/.test(w)) {
      // "768–1023px" — take the lower bound
      const m = w.match(/(\d{3,4})/);
      startPx = m ? parseInt(m[1], 10) : i * 400;
      displayPx = m ? `${m[1]}px` : w;
    } else {
      // "≥ 1280px" or plain number
      const m = w.match(/(\d{3,4})/);
      startPx = m ? parseInt(m[1], 10) : i * 400;
      displayPx = m ? `≥ ${m[1]}px` : w;
    }
    return { label: row.name, startPx, displayPx };
  });

  const rulerBands = bands.map((b, i) => ({
    label: b.label,
    displayPx: b.displayPx,
    startPx: b.startPx,
    endPx: bands[i + 1] ? bands[i + 1].startPx : MAX_PX,
    leftPct: ((b.startPx / MAX_PX) * 100).toFixed(1),
    widthPct: (((bands[i + 1] ? bands[i + 1].startPx : MAX_PX) - b.startPx) / MAX_PX * 100).toFixed(1),
  }));

  // Touch targets + collapsing notes — strip unresolved {token} refs
  const touchSection = body.match(/####\s+Touch Targets([\s\S]*?)(?=\n####\s|\n###\s|\n##\s|\s*$)/i)?.[1] ?? '';
  const collapseSection = body.match(/####\s+Collapsing Strategy([\s\S]*?)(?=\n####\s|\n###\s|\n##\s|\s*$)/i)?.[1] ?? '';
  const clean = t => t.trim().replace(/\n+/g, ' ').replace(/\{[^}]+\}/g, m => {
    const key = m.replace(/[{}]/g, '').split('.').pop();
    return `<em>${key}</em>`;
  });

  const notesHtml = [
    touchSection && `<strong>Touch targets:</strong> ${mdInline(clean(touchSection))}`,
    collapseSection && `<strong>Collapsing:</strong> ${mdInline(clean(collapseSection))}`,
  ].filter(Boolean).join(' ');

  return { rows, rulerBands, notesHtml };
}

const responsive = parseResponsive(markdownBody);

// ---------------------------------------------------------------------------
// Nunjucks environment with custom filters
// ---------------------------------------------------------------------------
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(TEMPLATES),
  { autoescape: false }
);

// fontStack: resolves a design-system font family name to a CSS web-safe stack
env.addFilter('fontStack', family => resolveFontStack(family).stack);

const ctx = {
  tokens,
  colorGroups,
  roundedEntries,
  typographyEntries,
  dosDonts,
  semanticAliases,
  missingAliases,
  elevationShadows,
  googleFontsUrl,
  componentCards,
  responsive,
  cssFile: `${OUTPUT_BASE}.css`,
};

// ---------------------------------------------------------------------------
// Render & write — back up existing files with a timestamp suffix
// ---------------------------------------------------------------------------
function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function writeWithBackup(filePath, content) {
  if (fs.existsSync(filePath)) {
    const { dir, name, ext } = path.parse(filePath);
    fs.renameSync(filePath, path.join(dir, `${name}${timestamp()}${ext}`));
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

writeWithBackup(
  path.join(OUTPUT_DIR, `${OUTPUT_BASE}.css`),
  env.render('design-preview.css.njk', ctx)
);
console.log(`✓  ${OUTPUT_BASE}.css`);

writeWithBackup(
  path.join(OUTPUT_DIR, `${OUTPUT_BASE}.html`),
  env.render('design-preview.html.njk', ctx)
);
console.log(`✓  ${OUTPUT_BASE}.html`);
