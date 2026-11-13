import json, sys

SRC = "/Users/timvandevelde/Sites/giant-design-system/tokens/raw/figma-variables.raw.json"
d = json.load(open(SRC))
cols = {c['id']: c for c in d['variableCollections']}
vars_by_id = {v['id']: v for v in d['variables']}

def mode(name):  # first modeId of a collection by name
    for c in cols.values():
        if c['name'] == name:
            return c['modes']
    return []

def col_id(name):
    for cid, c in cols.items():
        if c['name'] == name:
            return cid

BRAND_CID = col_id('Brand')

def hexc(v):
    r,g,b = round(v['r']*255), round(v['g']*255), round(v['b']*255)
    a = v.get('a',1)
    if a >= 0.999:
        return f"#{r:02x}{g:02x}{b:02x}"
    return f"rgb({r} {g} {b} / {round(a,3)})"

def resolve(val, modeid, brand_mode=None):
    # val is the entry in valuesByMode[modeid].
    # brand_mode pins which Brand mode (Giant/Liv) brand-collection aliases resolve to —
    # semantic → brand → foundation, and the brand layer is the one that forks per brand.
    if isinstance(val, dict) and val.get('type') == 'VARIABLE_ALIAS':
        tgt = vars_by_id[val['id']]
        vbm = tgt['valuesByMode']
        if tgt['variableCollectionId'] == BRAND_CID and brand_mode in vbm:
            mid = brand_mode
        else:
            mid = modeid if modeid in vbm else next(iter(vbm))
        inner, _ = resolve(vbm[mid], mid, brand_mode)
        return inner, tgt
    return val, None

def varname(name):
    return name.replace('/', '-').replace('(', '').replace(')', '').replace(' ', '-').lower()

def collect(colname, modeid, brand_mode=None):
    out = {}
    cid = col_id(colname)
    for v in d['variables']:
        if v['variableCollectionId'] != cid: continue
        vbm = v['valuesByMode']
        mid = modeid if modeid in vbm else next(iter(vbm))
        resolved, _ = resolve(vbm[mid], mid, brand_mode)
        out[varname(v['name'])] = (v['resolvedType'], resolved)
    return out

# --- Foundation (single mode) ---
fmid = mode('Foundation')[0]['modeId']
foundation = collect('Foundation', fmid)

# --- Brand: Giant default ---
giant = next(m['modeId'] for m in mode('Brand') if m['name']=='Giant')
liv   = next(m['modeId'] for m in mode('Brand') if m['name']=='Liv')
brand_giant = collect('Brand', giant)
brand_liv   = collect('Brand', liv)

# --- Semantic: Light + Dark ---
light = next(m['modeId'] for m in mode('Semantic') if m['name']=='Light')
dark  = next(m['modeId'] for m in mode('Semantic') if m['name']=='Dark')
# Resolve semantic per brand: semantic → brand (forks here) → foundation.
sem_light = collect('Semantic', light, giant)          # default = Giant (back-compat key)
sem_dark  = collect('Semantic', dark,  giant)
sem_light_liv = collect('Semantic', light, liv)
sem_dark_liv  = collect('Semantic', dark,  liv)

# --- Breakpoint: Mobile/Tablet/Desktop ---
bmid = {m['name']: m['modeId'] for m in mode('Breakpoint')}
bp = {n: collect('Breakpoint', mid) for n, mid in bmid.items()}

def fmtval(t, val):
    if t == 'COLOR': return hexc(val)
    if t == 'FLOAT': return f"{val}px" if isinstance(val,(int,float)) else str(val)
    return str(val)  # STRING

print(json.dumps({
 'foundation': {k:[t,fmtval(t,v)] for k,(t,v) in foundation.items()},
 'brand_giant': {k:[t,fmtval(t,v)] for k,(t,v) in brand_giant.items()},
 'brand_liv': {k:[t,fmtval(t,v)] for k,(t,v) in brand_liv.items()},
 'sem_light': {k:[t,fmtval(t,v)] for k,(t,v) in sem_light.items()},
 'sem_dark': {k:[t,fmtval(t,v)] for k,(t,v) in sem_dark.items()},
 'sem_light_liv': {k:[t,fmtval(t,v)] for k,(t,v) in sem_light_liv.items()},
 'sem_dark_liv': {k:[t,fmtval(t,v)] for k,(t,v) in sem_dark_liv.items()},
 'bp': {n:{k:[t,fmtval(t,v)] for k,(t,v) in m.items()} for n,m in bp.items()},
}, indent=1))
