# Shattered Oath — Game Design Core

## Direction
- Pixel-art top-down action RPG.
- Mobile-first and 100% landscape.
- No traditional character level / generic XP system.
- Progression is driven by masteries, skills, gear, crafting, discoveries, titles and achievements.
- The game remains playable after the main final boss.

## Masteries
Using a discipline improves that discipline. Examples:
- Melee
- Ranged
- Magic
- Shield
- Parry
- Dodge
- Fishing
- Crafting
- Alchemy
- Hunting / monsters
- Elites
- Bosses
- Exploration

Every mastery level gained grants 1 Skill Point.

Repeated meaningless actions should not be the optimal leveling strategy. Mastery gain should reward real gameplay, variety, successful combat and relevant encounters.

## Skill tree
- Skill Points come from mastery level-ups.
- Skills become progressively more expensive.
- Important nodes should change gameplay rather than only add small percentage bonuses.
- Some nodes also require a mastery threshold, quest, item, trainer NPC or world discovery.
- Respec should exist through an NPC/service with a meaningful cost.

## NPC trainers
Some techniques cannot be learned from the tree alone.
Trainer NPCs can require:
- reaching dangerous regions;
- completing quests;
- proving skill in a discipline;
- obtaining a special weapon or material;
- defeating a specific enemy / elite / boss.

## Combat
Planned combat families:
- melee;
- ranged;
- magic;
- shield blocking;
- parry / perfect parry;
- dodge / mobility;
- active abilities;
- passive build modifiers.

Parry has its own mastery. Higher mastery should primarily unlock new interactions and counters rather than making the parry window trivial.

## Drops and crafting
Enemies drop creature/material parts rather than simply handing out finished best-in-slot equipment.

General hierarchy:
- normal enemies: common materials and occasional rare components;
- elites: better materials and low-to-medium chances for important special drops;
- bosses: high/guaranteed access to signature materials plus chances for rarer rewards.

Boss and elite materials are used to craft relics, weapons, armor, abilities and modifiers inspired by those enemies.

## Blacksmith
Crafting equipment at the blacksmith requires:
1. required materials;
2. an in-game currency service fee.

The fee represents use of the blacksmith's forge/anvil and scales with item rarity/complexity.

Possible services:
- forge;
- upgrade;
- reforge;
- dismantle;
- infuse;
- later cosmetic/transmog systems.

The forge itself can be upgraded through quests and discoveries to work with higher-tier materials.

## Equipment
Weapons and armor should support build variety rather than only bigger numbers.
Possible effects include:
- parry interactions;
- elemental effects;
- perfect-dodge effects;
- boss/elite hunting bonuses;
- skill modifications;
- set synergies.

Avoid mandatory durability/repair unless the design later changes toward survival.

## Relics / abilities / passives
Relics and modifiers should strongly alter gameplay.
Examples:
- dash becomes teleport;
- dash leaves elemental trails;
- kills reset mobility skills;
- attacks create secondary projectiles;
- perfect parry causes stagger or reflects projectiles.

## Achievements and titles
Achievements can grant:
- abilities;
- titles;
- cosmetic recognition;
- specialized benefits.

Titles are equippable and can have useful but build-oriented perks.
Special achievements can be tied to bosses, such as no-hit, melee-only, magic-only or advanced parry challenges.

## Hub / city
The main safe area should be a real explorable location rather than a menu-only lobby.
Planned features include:
- blacksmith;
- merchants;
- travelling merchant appearances;
- trainers;
- alchemist;
- quest NPCs;
- storage;
- training arena;
- bestiary / records;
- later city upgrades.

## Commerce
The player can buy and sell items, weapons, armor and materials.
The travelling merchant has rotating or unusual stock.
Rare progression materials should not all be solvable with currency alone.

## Training and side modes
### Boss Training
After defeating a boss once, it becomes available for practice.
Training rewards no normal drops, money or mastery progression.

### Possible additional modes
- Boss Rush
- Arena / endless waves
- Build testing area

## Main final boss and post-game
Defeating the main final boss does NOT end the save.

Story concept:
The final boss was containing or sealing a corrupting force. Killing it releases that force into the world.

Post-game introduces:
- corruption across regions;
- mutated normal enemies;
- mutated elites;
- altered/corrupted bosses;
- new attacks and behaviors;
- new materials and drops;
- new recipes;
- new secondary questlines;
- new areas/secrets where appropriate.

Mutations should change behavior, not simply add HP/damage.
Examples:
- Frenzied
- Colossal
- Vampiric
- Void / teleporting
- Necromantic
- Explosive
- Splitting / swarm
- multi-mutation corrupted variants

Older pre-endgame materials should remain useful in post-game recipes so earlier regions do not become irrelevant.

## Technical target
- Phaser 3
- JavaScript ES modules
- HTML/CSS shell
- 1280×720 logical resolution
- responsive FIT scaling
- nearest-neighbor / pixel-art rendering
- mobile touch controls
- GitHub-hosted source and web testing
- Android packaging later from the same codebase

## Development rule
Build a small polished vertical slice first. Do not mass-produce content before movement, combat, save architecture, touch controls and the progression foundations are stable.
