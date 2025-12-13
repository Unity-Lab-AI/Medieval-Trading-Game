# World Map Backdrop - AI Image Generation

## WHAT YOU ARE MAKING

You are generating a **BACKDROP IMAGE** for a video game world map. This image goes BEHIND the game's UI. The game will render its own labels, icons, and markers ON TOP of your image.

**YOUR IMAGE MUST HAVE:**
- Pure terrain/landscape
- ROADS connecting locations (see road section below)
- A river flowing north to south
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
- **Style:** Painted medieval fantasy landscape, top-down/bird's eye view
- **Perspective:** Looking straight down at the land (like a satellite view but painted)

---

## THE TERRAIN LAYOUT

```
    ┌────────────────────────────────────────┐
    │     SNOWY MOUNTAINS (white/grey)       │  y: 0-150
    │   peaks, cliffs, snow, frozen lakes    │
    ├────────────────────────────────────────┤
    │ DARK      │ FOOTHILLS  │    COAST     │  y: 150-250
    │ FOREST    │  & HILLS   │   (water     │
    │ (left)    │  (center)  │    right)    │
    ├───────────┼────────────┼──────────────┤
    │ DENSE     │  CENTRAL   │   EASTERN    │  y: 250-350
    │ WOODS     │   HILL     │    SEA       │
    │ & QUARRY  │ (400,300)  │   (blue      │
    │           │  hub here  │   water)     │
    ├───────────┼────────────┼──────────────┤
    │ FOREST    │  GREEN     │  COASTAL     │  y: 350-450
    │ EDGE      │ FARMLAND   │   CLIFFS     │
    │           │  & RIVER   │              │
    ├───────────┴────────────┴──────────────┤
    │       ROLLING FARMLAND & RIVER        │  y: 450-600
    │   green fields, river flowing south   │
    │   Mediterranean coast bottom-right    │
    └────────────────────────────────────────┘
      x:0-200    x:200-500     x:500-800
```

---

## ROADS (VERY IMPORTANT!)

The map has 4 types of roads. Draw them as visible paths/roads on the terrain:

### Road Types & Visual Style

| Type | Width | Color | Where Used |
|------|-------|-------|------------|
| **Main Road** | Wide (6-8px) | Light tan/beige | Capital to cities |
| **Road** | Medium (4-5px) | Brown/dirt | City to town |
| **Path** | Narrow (2-3px) | Darker brown | To villages, farms, forests |
| **Trail** | Very thin (1-2px) | Faint brown/grey | To caves, mines, dungeons, outposts |

### Main Roads (Wide, Paved Look)

These are the major trade routes - draw them as wide, well-maintained roads:

```
Center Hub (400, 300) connects to:
├── NORTH to (400, 160)  - Main Road going straight up
├── EAST to (560, 280)   - Main Road going right
├── WEST to (240, 300)   - Main Road going left
└── SOUTH to (400, 440)  - Main Road going down
```

### Secondary Roads & Paths

From the northern city (400, 160):
- Path northwest to (280, 160)
- Path north to (460, 100)
- Trail to (340, 100)
- Road to (340, 200)

From the eastern city (560, 280):
- Path to (620, 200)
- Path to (620, 340)
- Road to (520, 360)
- Path to (680, 340)

From the western city (240, 300):
- Path to (160, 240)
- Trail to (180, 420)
- Road to (160, 340)

From the southern city (400, 440):
- Path to (320, 480)
- Path to (480, 500)
- Path to (340, 380)
- Road to (380, 500)
- Road to (520, 460)

### Additional Connections

Northern Mountains:
- Trail: (340, 100) to (300, 60)
- Trail: (460, 100) to (520, 40)
- Trail: (520, 40) to (540, 60)
- Trail: (200, 100) to (140, 60)
- Path: (280, 160) to (200, 100)
- Road: (280, 160) to (220, 200)

Western Forest:
- Trail: (160, 240) to (120, 180)
- Trail: (120, 180) to (60, 220)
- Trail: (120, 180) to (80, 120)
- Trail: (160, 240) to (100, 280)
- Trail: (140, 380) to (100, 420)
- Trail: (100, 420) to (60, 480)

Eastern Coast:
- Path: (620, 200) to (680, 160)
- Trail: (680, 160) to (720, 120)
- Path: (620, 200) to (680, 260)
- Path: (680, 340) to (720, 420)
- Trail: (720, 420) to (640, 500)

Southern Farmland:
- Path: (320, 480) to (220, 480)
- Path: (220, 480) to (260, 520)
- Trail: (260, 520) to (200, 560)
- Path: (480, 500) to (540, 540)
- Path: (520, 460) to (580, 520)
- Path: (520, 460) to (640, 440)
- Trail: (640, 440) to (640, 500)

---

## THE RIVER (IMPORTANT!)

Draw the "Silver River" as a winding blue waterway:
- **Starts:** Northern mountains around (350, 50)
- **Flows:** South through center, roughly following x: 400-450
- **Passes near:** (400, 300), (400, 440), (480, 500)
- **Ends:** Southern coast around (500, 600)

Make it natural and winding - NOT a straight line. Should be 8-15 pixels wide.

---

## TERRAIN BY REGION

### TOP (y: 0-200) - MOUNTAINS
- Snow-capped mountain range across full width
- Grey rocky peaks with white snow
- Frozen lakes/ice patches
- Pine trees at lower elevations

### LEFT (x: 0-250) - DARK FOREST
- Dense, dark evergreen forest
- Deep shadows between trees
- Small clearings where settlements would be
- Rocky quarry area around (180, 420)
- Mysterious atmosphere

### CENTER (x: 250-550) - HILLS & FARMLAND
- Rolling green hills
- Central prominent hill at (400, 300)
- River flowing through
- Farm field patterns in lower areas

### RIGHT (x: 550-800) - COAST & SEA
- Ocean water (blue) along right edge
- Sandy beaches
- Some coastal cliffs
- Harbor indentations for ports

### BOTTOM CENTER (y: 400-600) - FARMLAND
- Patchwork farm fields (greens, golds)
- Orchards (tree clusters)
- Vineyards (row patterns)
- River continuing south

### BOTTOM RIGHT (x: 500-700, y: 400-600) - MEDITERRANEAN
- Warmer colors (tan, terracotta)
- White cliff areas
- Turquoise bay water

---

## COLOR PALETTE

| Element | Color | Hex |
|---------|-------|-----|
| Mountains | Grey | #6B7B8C |
| Snow | White | #F5F5F5 |
| Dark Forest | Deep green | #1B4D1B |
| Forest | Green | #2D5A27 |
| Farmland | Light green | #7CB342 |
| Wheat Fields | Gold | #D4A84B |
| Water/Sea | Blue | #4A90A4 |
| Mediterranean | Tan | #D4C4A8 |
| Main Roads | Light tan | #C4A672 |
| Roads | Brown | #8B7355 |
| Paths | Dark brown | #5D4E37 |
| Trails | Grey-brown | #4A4A4A |

---

## WHAT TO AVOID

❌ **NO TEXT** - No location names, labels, or words
❌ **NO ICONS** - No castle/house/pickaxe markers
❌ **NO LOCATION MARKERS** - No dots or pins
❌ **NO COMPASS** - No compass rose
❌ **NO BORDERS** - No decorative frame
❌ **NO UI** - Nothing that looks like interface

The game draws labels and icons on top. Only include TERRAIN and ROADS.

---

## FINAL CHECKLIST

- [ ] 800 x 600 pixels exactly
- [ ] NO TEXT anywhere
- [ ] NO ICONS or markers
- [ ] Roads ARE included (main roads, paths, trails)
- [ ] River flows north to south through center
- [ ] Mountains at TOP
- [ ] Ocean on RIGHT side
- [ ] Dark forest on LEFT
- [ ] Farmland BOTTOM CENTER
- [ ] Mediterranean BOTTOM RIGHT

---

## SIMPLE ONE-LINE PROMPT

```
Medieval fantasy landscape, 800x600 pixels, top-down bird's eye view, painted style. Snowy mountains across top, dark dense forest on left side, blue ocean coast on right side, green rolling farmland in center and bottom, Mediterranean coast bottom-right. Include visible roads: wide tan main roads from center (400,300) to north (400,160), east (560,280), west (240,300), south (400,440). Narrower brown paths connecting secondary locations. Faint trails to remote mountain and forest areas. A winding river flows from northern mountains through center to southern coast. NO TEXT, NO LABELS, NO ICONS, NO BORDERS - terrain and roads only.
```
