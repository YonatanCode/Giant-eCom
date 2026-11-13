import json, subprocess, sys

d = json.loads(subprocess.check_output(['python3', 'scripts/extract-tokens.py']))

def fam(F):
    return {
        'Open Sans': '"Open Sans", system-ui, sans-serif',
        'Helvetica': '"Helvetica", "Helvetica Neue", system-ui, sans-serif',
        'Gotham': 'Gotham, "Helvetica Neue", system-ui, sans-serif',
        'Overpass': 'Overpass, system-ui, sans-serif',
    }.get(F, f'{F}, system-ui, sans-serif')

# ---- typography token -> (fs key, lh key) in bp collection ----
TYPE = {
 'action-l': ('typography-action-action-l-font-size','typography-action-action-l-line-height'),
 'action-m': ('typography-action-action-m-font-size','typography-action-action-m-line-height'),
 'action-s': ('typography-action-action-s-font-size','typography-action-action-s-line-height'),
 'body-l': ('typography-body-body-l-font-size','typography-body-body-l-line-height'),
 'body-m': ('typography-body-body-m-font-size','typography-body-body-m-line-height'),
 'body-s': ('typography-body-body-s-font-size','typography-body-body-s-line-height'),
 'display-xl': ('typography-display-display-xl-font-size','typography-display-display-xl-line-height'),
 'display-l': ('typography-display-display-l-font-size','typography-display-display-l-line-height'),
 'display-m': ('typography-display-display-m-font-size','typography-display-display-m-line-height'),
 'display-s': ('typography-display-display-s-font-size','typography-display-display-s-line-height'),
 'heading-l': ('typography-heading-heading-l-font-size','typography-heading-heading-l-line-height'),
 'heading-m': ('typography-heading-heading-m-font-size','typography-heading-heading-m-line-height'),
 'heading-s': ('typography-heading-heading-s-font-size','typography-heading-heading-s-line-height'),
 'nav-l': ('typography-nav-nav-l-font-size','typography-nav-nav-l-line-height'),
 'nav-m': ('typography-nav-nav-m-font-size','typography-nav-nav-m-line-height'),
 'nav-s': ('typography-nav-nav-s-font-size','typography-nav-nav-s-line-height'),
 'price-l': ('typography-price-price-l-font-size','typography-price-price-line-height'),
 'price-m': ('typography-price-price-m-font-size','typography-price-price-m-line-height'),
 'price-s': ('typography-price-price-s-font-size','typography-price-price-s-line-height'),
 'product-title-l': ('typography-product-product-title-l-font-size','typography-product-product-title-line-height'),
 'product-title-m': ('typography-product-product-title-m-font-size','typography-product-product-title-m-line-height'),
 'product-title-s': ('typography-product-product-title-s-font-size','typography-product-product-title-s-line-height'),
}
bp = d['bp']
def bval(mode, key):
    return bp[mode].get(key, ['',''])[1]
# per token: {mode: (fs,lh)}
typ = {}
for tok,(fk,lk) in TYPE.items():
    typ[tok] = {m: (bval(m,fk), bval(m,lk)) for m in ('Mobile','Tablet','Desktop')}

HEADER = '''@import "tailwindcss";

/* Generated from giant-design-system figma-variables (non-OLD collections). */
/* Brand: Giant (default) / Liv via [data-brand="liv"]. Theme: Light / Dark via .dark */

@custom-variant dark (&:where(.dark, .dark *));

/* Self-hosted static weights (public/fonts). Overpass = Giant, Gotham = Liv. */
@font-face { font-family: "Overpass"; src: url("/fonts/overpass/overpass-regular.woff2") format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: "Overpass"; src: url("/fonts/overpass/overpass-semibold.woff2") format("woff2"); font-weight: 600; font-style: normal; font-display: swap; }
@font-face { font-family: "Overpass"; src: url("/fonts/overpass/overpass-bold.woff2") format("woff2"); font-weight: 700; font-style: normal; font-display: swap; }
@font-face { font-family: "Overpass"; src: url("/fonts/overpass/overpass-extrabold.woff2") format("woff2"); font-weight: 800; font-style: normal; font-display: swap; }

@font-face { font-family: "Gotham"; src: url("/fonts/gotham/gotham-book.woff2") format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: "Gotham"; src: url("/fonts/gotham/gotham-book-italic.woff2") format("woff2"); font-weight: 400; font-style: italic; font-display: swap; }
@font-face { font-family: "Gotham"; src: url("/fonts/gotham/gotham-medium.woff2") format("woff2"); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: "Gotham"; src: url("/fonts/gotham/gotham-medium-italic.woff2") format("woff2"); font-weight: 500; font-style: italic; font-display: swap; }
@font-face { font-family: "Gotham"; src: url("/fonts/gotham/gotham-bold.woff2") format("woff2"); font-weight: 700; font-style: normal; font-display: swap; }

@font-face { font-family: "Open Sans"; src: url("/fonts/open-sans/open-sans-regular.woff2") format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }
'''

out = [HEADER, '@theme {']

# foundation
out.append('  /* foundation colors */')
for k,(t,v) in d['foundation'].items():
    if t=='COLOR': out.append(f'  --color-{k[len("colors-"):]}: {v};')
# brand giant colors
out.append('  /* brand colors (Giant) */')
giant = d['brand_giant']
for k,(t,v) in giant.items():
    if t=='COLOR' and k not in ('colors-white','colors-black'):
        out.append(f'  --color-{k[len("colors-"):]}: {v};')
# semantic light, grouped
sem = d['sem_light']
groups = [('base','base'),('action','action'),('commerce','commerce'),('feedback','feedback')]
for label,pref in groups:
    out.append(f'  /* semantic colors (Light) — {label} */')
    for k,(t,v) in sem.items():
        if k.startswith(pref+'-'): out.append(f'  --color-{k}: {v};')
    if pref == 'base' and 'base-icon-subtle' not in sem and 'base-text-muted' in sem:
        out.append(f'  --color-base-icon-subtle: {sem["base-text-muted"][1]};')
# spacing
out.append('  /* spacing */')
for k,(t,v) in d['foundation'].items():
    if t=='FLOAT' and k.startswith('spacing-'): out.append(f'  --{k}: {v};')
# fonts (giant): family + weight per role
ROLES = ('heading','body','display','action','nav','price','product-title')
def weight(brand, role):
    w = brand.get(f'font-{role}-font-weight')
    return w[1].rstrip('px') if w else None  # FLOAT is emitted with a px suffix upstream
out.append('  /* fonts (Giant): family + weight per role */')
for role in ROLES:
    F = giant.get(f'font-{role}-font-family')
    if F: out.append(f'  --font-{role}: {fam(F[1])};')
    w = weight(giant, role)
    if w: out.append(f'  --font-weight-{role}: {w};')
# token prefix -> role (longest match first so product-title beats nothing shorter)
def role_of(tok):
    for r in sorted(ROLES, key=len, reverse=True):
        if tok.startswith(r + '-'): return r
    return None
# typography text tokens: size + line-height + role weight (so text-* is complete)
out.append('  /* typography (fluid: see :root + media queries) */')
for tok in TYPE:
    out.append(f'  --text-{tok}: var(--fs-{tok});')
    out.append(f'  --text-{tok}--line-height: var(--lh-{tok});')
    r = role_of(tok)
    if r: out.append(f'  --text-{tok}--font-weight: var(--font-weight-{r});')
out.append('}')
out.append('')

# ---- :root + media for fs/lh + layout-page-padding ----
def emit_root(mode, only_changed_from=None):
    lines = []
    for tok in TYPE:
        fs,lh = typ[tok][mode]
        if only_changed_from is None or typ[tok][only_changed_from] != (fs,lh):
            lines.append(f'  --fs-{tok}: {fs};  --lh-{tok}: {lh};')
    return lines

# :root = Mobile base, all tokens
out.append(':root {')
out += emit_root('Mobile')
out.append(f'  --layout-page-padding: {bval("Mobile","layout-page-padding")};')
out.append('}')
out.append('')
# 768 = Tablet, only changed vs Mobile
t = emit_root('Tablet', 'Mobile')
if bval('Tablet','layout-page-padding') != bval('Mobile','layout-page-padding'):
    t.append(f'  --layout-page-padding: {bval("Tablet","layout-page-padding")};')
out.append('@media (min-width: 768px) { :root {')
out += t
out.append('} }')
out.append('')
# 1024 = Desktop, only changed vs Tablet
dd = emit_root('Desktop', 'Tablet')
if bval('Desktop','layout-page-padding') != bval('Tablet','layout-page-padding'):
    dd.append(f'  --layout-page-padding: {bval("Desktop","layout-page-padding")};')
out.append('@media (min-width: 1024px) { :root {')
out += dd
out.append('} }')
out.append('')

# ---- .dark overrides (semantic dark differs from light) ----
darkv = d['sem_dark']
out.append('.dark {')
for label,pref in groups:
    chg = [(k, darkv[k][1]) for k in sem if k.startswith(pref+'-') and k in darkv and darkv[k][1] != sem[k][1]]
    if pref == 'base' and 'base-icon-subtle' not in darkv and 'base-text-muted' in darkv and darkv['base-text-muted'][1] != sem['base-text-muted'][1]:
        chg.append(('base-icon-subtle', darkv['base-text-muted'][1]))
    if chg:
        out.append(f'  /* {label} */')
        for k,v in chg: out.append(f'  --color-{k}: {v};')
out.append('}')
out.append('')

# ---- [data-brand="liv"] : brand primitives, fonts, and Liv-resolved semantic tokens ----
# Semantic tokens alias brand colors, so Liv shifts them (action-surface→primary, etc.).
# Emit only the semantic values that differ from Giant's light defaults.
liv = d['brand_liv']
liv_light = d['sem_light_liv']
out.append('[data-brand="liv"] {')
for k,(t,v) in liv.items():
    if t=='COLOR' and k not in ('colors-white','colors-black') and giant.get(k,[None,None])[1] != v:
        out.append(f'  --color-{k[len("colors-"):]}: {v};')
for role in ROLES:
    F = liv.get(f'font-{role}-font-family')
    if F and giant.get(f'font-{role}-font-family',[None,None])[1] != F[1]:
        out.append(f'  --font-{role}: {fam(F[1])};')
    wl, wg = weight(liv, role), weight(giant, role)
    if wl and wl != wg: out.append(f'  --font-weight-{role}: {wl};')
for label,pref in groups:
    chg = [(k, liv_light[k][1]) for k in sem if k.startswith(pref+'-') and k in liv_light and liv_light[k][1] != sem[k][1]]
    if pref == 'base' and 'base-icon-subtle' not in liv_light and 'base-text-muted' in liv_light and liv_light['base-text-muted'][1] != sem['base-text-muted'][1]:
        chg.append(('base-icon-subtle', liv_light['base-text-muted'][1]))
    if chg:
        out.append(f'  /* {label} */')
        for k,v in chg: out.append(f'  --color-{k}: {v};')
out.append('}')
out.append('')

# ---- [data-brand="liv"] .dark : Liv + dark. Higher specificity than .dark alone, so it wins
# for dark sections under the Liv brand. Deltas vs Giant-dark (already applied by .dark). ----
liv_dark = d['sem_dark_liv']
out.append('[data-brand="liv"] .dark {')
for label,pref in groups:
    chg = [(k, liv_dark[k][1]) for k in sem if k.startswith(pref+'-') and k in liv_dark and liv_dark[k][1] != darkv.get(k,[None,None])[1]]
    if pref == 'base' and 'base-icon-subtle' not in liv_dark and 'base-text-muted' in liv_dark and liv_dark['base-text-muted'][1] != darkv.get('base-text-muted',[None,None])[1]:
        chg.append(('base-icon-subtle', liv_dark['base-text-muted'][1]))
    if chg:
        out.append(f'  /* {label} */')
        for k,v in chg: out.append(f'  --color-{k}: {v};')
out.append('}')
out.append('')

out.append('''@layer base {
  body {
    background-color: var(--color-base-surface);
    color: var(--color-base-text);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4 {
    font-family: var(--font-heading);
    color: var(--color-base-text-heading);
  }
}''')

open('src/app/(finder)/globals.css','w').write('\n'.join(out) + '\n')
print('wrote src/app/(finder)/globals.css')
