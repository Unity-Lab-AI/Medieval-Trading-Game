# Tutorial Map Backdrop - AI Image Generation

## WHAT YOU ARE MAKING

You are generating a **BACKDROP IMAGE** for the tutorial world map. This image goes BEHIND the game's UI. The game will render its own labels, icons, and markers ON TOP of your image.

**YOUR IMAGE MUST HAVE:**
- Pure terrain/landscape
- ROADS connecting locations (see road section below)
- NO text of any kind
- NO labels or names
- NO icons or markers
- NO compass rose
- NO borders or frames

Think of it like painting a landscape with roads that will have location stickers placed on top later.

---

## IMAGE SPECIFICATIONS

- **Size:** 800 x 600 pixels (EXACTLY)
- **Format:** PNG
- **Filename:** `tutorial-map-bg.png`
- **Save Location:** `src/images/maps/tutorial-map-bg.png`
- **Style:** Painted medieval fantasy landscape, top-down/bird's eye view
- **Perspective:** Looking straight down at the land (like a satellite view but painted)

---

## THE TERRAIN LAYOUT

```
    ┌────────────────────────────────────────┐
    │  ROCKY           │      TRAINING       │  y: 0-200
    │  HIGHLANDS       │      GROUNDS        │
    │  (dark, rocky)   │   (cleared, sandy)  │
    │                  │                     │
    │    ◆ DUNGEON     │       ◆ ARENA      │  y: 120
    │    (150,120)     │      (650,120)      │
    ├──────────────────┴─────────────────────┤
    │                                        │  y: 200-350
    │           CENTRAL FOREST               │
    │        (dense green woodland)          │
    │                                        │
    │              ◆ FOREST                  │  y: 280
    │              (400,280)                 │
    │            (clearing here)             │
    ├────────────────────────────────────────┤
    │   PASTORAL         │    DEVELOPED      │  y: 350-600
    │   FARMLAND         │      LAND         │
    │  (green fields,    │  (roads, cleared, │
    │   wheat, rolling)  │   town area)      │
    │                    │                   │
    │   ◆ VILLAGE        │      ◆ TOWN       │  y: 450
    │   (150,450)        │     (650,450)     │
    └────────────────────┴───────────────────┘
      x: 0-400            x: 400-800
```

---

## ROADS (VERY IMPORTANT!)

The map has 3 types of roads. Draw them as visible paths/roads on the terrain:

### Road Types & Visual Style

| Type | Width | Color | Where Used |
|------|-------|-------|------------|
| **Main Road** | Wide (6-8px) | Light tan/beige | Village to Town (trading route) |
| **Road** | Medium (4-5px) | Brown/dirt | Town to Arena, Town to Forest |
| **Path** | Narrow (2-3px) | Darker brown | Village to Forest, Forest to Arena |
| **Trail** | Very thin (1-2px) | Faint grey | Arena to Dungeon (ominous) |

### Road Connections

```
Main Roads (Wide, Well-Maintained):
Village (150, 450) ←────────────────────────→ Town (650, 450)
                   (horizontal trading road)

Secondary Roads (Medium):
Town (650, 450) ───────→ Forest (400, 280) ───────→ Town
Town (650, 450) ────────────────────────────→ Arena (650, 120)
                         (vertical road up)

Paths (Narrow):
Village (150, 450) ───→ Forest (400, 280)
                (diagonal up-right through farmland into trees)

Forest (400, 280) ───→ Arena (650, 120)
                (winding path through trees, then cleared land)

Trails (Faint, Ominous):
Arena (650, 120) ←─────────────────────────→ Dungeon (150, 120)
                   (horizontal across rocky terrain)
```

### Road Coordinate Paths

**Village → Town (Main Road)**
- Start: (150, 450)
- End: (650, 450)
- Style: Wide, light tan, well-traveled trading route
- Runs horizontally across bottom third

**Village → Forest (Path)**
- Start: (150, 450)
- Via: Curve through farmland
- End: (400, 280)
- Style: Narrow brown path entering the woods

**Town → Forest (Road)**
- Start: (650, 450)
- Via: Curve left through developed land
- End: (400, 280)
- Style: Medium dirt road skirting forest edge

**Town → Arena (Road)**
- Start: (650, 450)
- End: (650, 120)
- Style: Medium road going straight north (vertical)

**Forest → Arena (Path)**
- Start: (400, 280)
- Via: Winding through trees
- End: (650, 120)
- Style: Narrow path through woodland then cleared land

**Arena → Dungeon (Trail)**
- Start: (650, 120)
- End: (150, 120)
- Style: Very thin, faint trail across rocky highlands
- Should look ominous, less traveled

---

## TERRAIN BY REGION

### TOP-LEFT (x: 0-400, y: 0-200) - ROCKY HIGHLANDS
- Dark grey rocky terrain
- Scattered boulders and outcrops
- Sparse vegetation
- Cave/dungeon entrance area around (150, 120)
- Shadowy, foreboding atmosphere
- Some dark evergreen trees

### TOP-RIGHT (x: 400-800, y: 0-200) - TRAINING GROUNDS
- Cleared, flattened land
- Sandy/tan coloring around arena (650, 120)
- Some training structures implied by terrain
- Transition from rocky (left) to cleared (right)
- Military/organized appearance

### CENTER (x: 150-650, y: 200-380) - FOREST
- Dense green woodland
- Mixed deciduous and evergreen trees
- Clearing at center point (400, 280)
- Dappled sunlight feeling
- Paths visible cutting through trees
- Friendly, explorable atmosphere

### BOTTOM-LEFT (x: 0-400, y: 380-600) - FARMLAND
- Rolling green hills
- Wheat field patches (golden/tan)
- Pastoral countryside
- Village area at (150, 450)
- Small farm plots visible
- Peaceful, safe feeling

### BOTTOM-RIGHT (x: 400-800, y: 380-600) - DEVELOPED LAND
- More structured terrain
- Roads more visible
- Town area at (650, 450)
- Transition from rural to urban
- Cleared land, organized layout
- Cobblestone texture hints

---

## COLOR PALETTE

| Element | Color | Hex |
|---------|-------|-----|
| Rocky Highlands | Dark grey | #4A4A4A |
| Cave/Shadow | Near black | #2F2F2F |
| Training Grounds | Sandy tan | #C2B280 |
| Forest (dense) | Deep green | #2D5A27 |
| Forest (light) | Medium green | #4A7C3F |
| Forest Clearing | Light green | #7CB342 |
| Farmland | Grass green | #5B8C3F |
| Wheat Fields | Golden | #D4A84B |
| Town Area | Tan/brown | #B8A07A |
| Main Roads | Light tan | #C4A672 |
| Roads | Brown | #8B7355 |
| Paths | Dark brown | #5D4E37 |
| Trails | Grey-brown | #5A5A5A |

---

## WHAT TO AVOID

❌ **NO TEXT** - No location names, labels, or words
❌ **NO ICONS** - No castle/house/pickaxe markers
❌ **NO LOCATION MARKERS** - No dots or pins
❌ **NO COMPASS** - No compass rose
❌ **NO BORDERS** - No decorative frame or parchment edges
❌ **NO UI** - Nothing that looks like interface
❌ **NO HAND-DRAWN STYLE** - Use painted/realistic terrain style

The game draws labels and icons on top. Only include TERRAIN and ROADS.

---

## LOCATION SUMMARY

| Location | Coordinates | Terrain Type |
|----------|-------------|--------------|
| Village | (150, 450) | Farmland, pastoral |
| Town | (650, 450) | Developed, urban |
| Forest | (400, 280) | Woodland clearing |
| Arena | (650, 120) | Sandy training grounds |
| Dungeon | (150, 120) | Rocky highlands, cave |

---

## FINAL CHECKLIST

- [ ] 800 x 600 pixels exactly
- [ ] NO TEXT anywhere
- [ ] NO ICONS or markers
- [ ] Roads ARE included (main road, roads, paths, trails)
- [ ] Rocky highlands TOP-LEFT
- [ ] Training grounds TOP-RIGHT
- [ ] Forest in CENTER with clearing at (400, 280)
- [ ] Farmland BOTTOM-LEFT
- [ ] Developed/Town area BOTTOM-RIGHT
- [ ] All 6 road connections visible

---

## SIMPLE ONE-LINE PROMPT

```
Medieval fantasy landscape, 800x600 pixels, top-down bird's eye view, painted style. Rocky dark highlands in top-left with cave entrance area at (150,120). Sandy cleared training grounds in top-right with arena area at (650,120). Dense green forest across center with clearing at (400,280). Pastoral farmland with wheat fields in bottom-left, village area at (150,450). Developed town terrain in bottom-right at (650,450). Include visible roads: wide tan main road connecting bottom-left to bottom-right horizontally, medium brown roads from bottom-right to center and bottom-right to top-right vertically, narrow paths from bottom-left to center and center to top-right, faint grey trail across top from top-right to top-left. NO TEXT, NO LABELS, NO ICONS, NO BORDERS, NO PARCHMENT STYLE - terrain and roads only.
```

---

*Unity AI Lab - Medieval Trading Game v0.91.02*
