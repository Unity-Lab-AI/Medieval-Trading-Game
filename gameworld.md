# Game World Reference Data 🗺️🖤

**PURPOSE:** This file contains the RAW DATA for the game world. This is NOT for generating images - see `gameworldprompt.md` for that.

This file is for developers who need to understand the world structure, add new locations, or debug game logic (debugging = fixing code, NOT the Debooger Console 🐛).

---

## Quick Stats
- **42 locations** across **6 regions**
- **Map size:** 800 x 600 pixels
- **Center:** Royal Capital at (400, 300)

---

## Regions

| Region | Y-Range | Description |
|--------|---------|-------------|
| Northern | 40-200 | Snowy mountains, forges, mines |
| Eastern | x: 560-720 | Asian-inspired coast, ports |
| Western | x: 60-240 | Dense dark forests, dungeons |
| Starter/Riverlands | 380-560 | Green farmland, starting area |
| Southern | 440-520 | Mediterranean coast |
| Capital | Center | Royal Capital hub |

---

## All 42 Location Coordinates

```
NORTHERN (y: 40-200):
  crystal_cave       (140, 60)
  silver_mine        (200, 100)
  deep_cavern        (300, 60)
  iron_mines         (340, 100)
  winterwatch        (480, 40)
  frostholm          (460, 100)
  frozen_cave        (520, 40)
  ruins_of_eldoria   (540, 60)
  silverkeep         (280, 160)
  ironforge_city     (400, 160)
  mountain_pass_inn  (220, 200)
  northern_outpost   (340, 200)

WESTERN (x: 60-240):
  druid_grove        (60, 220)
  forest_dungeon     (80, 120)
  hermit_grove       (100, 280)
  deep_mine          (100, 420)
  ancient_forest     (120, 180)
  miners_rest        (140, 380)
  darkwood           (160, 240)
  western_outpost    (160, 340)
  stone_quarry       (180, 420)
  stonebridge        (240, 300)
  shadow_dungeon     (60, 480)

EASTERN (x: 560-720):
  jade_harbor        (560, 280)
  silk_road_inn      (520, 360)
  hillcrest          (620, 200)
  eastern_farm       (620, 340)
  shepherds_inn      (680, 260)
  fishermans_port    (680, 340)
  whispering_woods   (680, 160)
  fairy_cave         (720, 120)
  smugglers_cove     (720, 420)

CENTER:
  royal_capital      (400, 300)
  kings_inn          (460, 360)

STARTER/RIVERLANDS (y: 380-560):
  wheat_farm         (340, 380)
  orchard_farm       (220, 480)
  hunters_wood       (260, 520)
  vineyard_village   (320, 480)
  riverside_inn      (380, 500)
  greendale          (400, 440)
  riverwood          (480, 500)
  river_cave         (540, 540)
  hunting_lodge      (200, 560)

SOUTHERN (x: 520-640, y: 440-520):
  sunhaven           (520, 460)
  sunny_farm         (580, 520)
  lighthouse_inn     (640, 440)
  coastal_cave       (640, 500)
```

---

## Terrain Zones (for backdrop reference)

The backdrop image should show these terrain types in these areas:

| Area | Terrain | Visual |
|------|---------|--------|
| Top (y: 0-200) | Mountains | Snow-capped peaks, rocky cliffs |
| Top-left corner | Dark forest | Dense evergreen, shadows |
| Left side (x: 0-200) | Dense forest | Dark woods, clearings |
| Center | Rolling hills | Castle hill in center |
| Right side (x: 600-800) | Coast | Ocean water, beaches |
| Bottom center | Farmland | Green fields, river |
| Bottom right | Mediterranean | Coastal cliffs, warm colors |

---

## Water Features

- **Silver River:** Starts in northern mountains, flows south through center, exits at southern coast
- **Eastern Sea:** Right edge of map (x: 700-800)
- **Southern Bay:** Bottom right area near Sunhaven

---

## Road Network

Main roads radiate from Royal Capital (400, 300) like spokes:
- North to Ironforge
- East to Jade Harbor
- West to Stonebridge
- South to Greendale

Secondary roads connect other locations. The game renders roads programmatically - the backdrop should NOT include roads.

---

## Location Types

| Type | Count | Examples |
|------|-------|----------|
| capital | 1 | Royal Capital |
| city | 6 | Ironforge, Jade Harbor, etc. |
| village | 6 | Frostholm, Darkwood, etc. |
| mine | 4 | Iron Mines, Silver Mine, etc. |
| forest | 5 | Ancient Forest, etc. |
| farm | 4 | Wheat Farm, etc. |
| cave | 6 | Crystal Cave, etc. |
| inn | 7 | King's Inn, etc. |
| dungeon | 2 | Shadow Dungeon, Forest Dungeon |
| ruins | 1 | Ruins of Eldoria |
| outpost | 3 | Northern, Western, Winterwatch |
| port | 2 | Fisherman's Port, Smuggler's Cove |

---

## Important Notes for Image Generation

**DO NOT** include in the backdrop image:
- Location names/labels
- Icons or markers
- Road lines
- Player markers
- Any text whatsoever

The game renders all UI elements (labels, icons, roads, markers) ON TOP of the backdrop. The backdrop should be PURE TERRAIN only.

**See `gameworldprompt.md` for the actual image generation instructions.**
