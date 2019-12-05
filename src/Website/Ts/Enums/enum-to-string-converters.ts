﻿import { ResourceType } from "./resource-type";
import { ExistsIn } from "./exists-in";
import { GameMode } from "./game-mode";
import { Tag } from "./tags";
import { GameplayEventType } from "./gameplay-event-type";
import { SubmissionType } from "./submission-type";

const convertGameModeToString = (mode: GameMode): string => {
    switch (mode) {
        case GameMode.AllModes: return 'All Modes';
        case GameMode.Normal: return 'Normal';
        case GameMode.Hard: return 'Hard';
        case GameMode.Greed: return 'Greed Mode';
        case GameMode.Greedier: return 'Greedier Mode';
        case GameMode.SpecialChallenge: return 'Special Challenge';
        case GameMode.SpecialSeed: return 'Special Seed';
        case GameMode.Unspecified: return 'Unspecified';
        case GameMode.HardAndNormal: return 'Hard and Normal';
        case GameMode.CommunityChallenge: return 'Community Challenge';
        default: return '';
    }
}

const convertExistsInToString = (n: ExistsIn): string => {
    switch (n) {
        case ExistsIn.Nowhere: return 'Nowhere';
        case ExistsIn.EveryVersion: return 'Every Version';
        case ExistsIn.VanillaOnly: return 'Vanilla Exclusive';
        case ExistsIn.WrathOfTheLambOnly: return 'Wrath of the Lamb Exclusive';
        case ExistsIn.CommunityRemixOnly: return 'Community Remix Exclusive';
        case ExistsIn.RebirthOnly: return 'Rebirth Exclusive';
        case ExistsIn.AfterbirthOnly: return 'Afterbirth Exclusive';
        case ExistsIn.AntibirthOnly: return 'Antibirth Exclusive';
        case ExistsIn.AfterbirthPlusOnly: return 'Afterbirth† Exclusive';
        case ExistsIn.RepentanceOnly: return 'Repentance Exclusive';
        case ExistsIn.BoosterPack1Only: return 'Booster Pack 1 Exclusive';
        case ExistsIn.BoosterPack2Only: return 'Booster Pack 2 Exclusive';
        case ExistsIn.BoosterPack3Only: return 'Booster Pack 3 Exclusive';
        case ExistsIn.BoosterPack4Only: return 'Booster Pack 4 Exclusive';
        case ExistsIn.BoosterPack5Only: return 'Booster Pack 5 Exclusive';
        case ExistsIn.VanillaOnwards: return 'Vanilla Onwards';
        case ExistsIn.WrathOfTheLambOnwards: return 'Wrath of the Lamb Onwards';
        case ExistsIn.CommunityRemixOnwards: return 'Community Remix Onwards';
        case ExistsIn.RebirthOnwards: return 'Rebirth Onwards';
        case ExistsIn.AfterbirthOnwards: return 'Afterbirth Onwards';
        case ExistsIn.AnitbirthOnwards: return 'Antibirth Onwards';
        case ExistsIn.AfterbirthPlusOnwards: return 'Afterbirth† Onwards';
        case ExistsIn.BoosterPack1Onwards: return 'Booster Pack 1 Onwards';
        case ExistsIn.BoosterPack2Onwards: return 'Booster Pack 2 Onwards';
        case ExistsIn.BoosterPack3Onwards: return 'Booster Pack 3 Onwards';
        case ExistsIn.BoosterPack4Onwards: return 'Booster Pack 4 Onwards';
        case ExistsIn.BoosterPack5Onwards: return 'Booster Pack 5 Onwards';
        case ExistsIn.RepentanceOnwards: return 'Repentance Onwards';
        case ExistsIn.Unspecified: return 'Unspecified';
        case ExistsIn.AntibirthAndRepentanceOnwards: return 'Antibirth & Repentance Onwards';
        case ExistsIn.CommunityRemixAndAntibirth: return 'Antibirth & Community Remix';
        case ExistsIn.CommunityRemixAndAntibirthAndRepentanceOnwards: return 'Community Remix, Antibirth, Repentance Onwards';
        case ExistsIn.CommunityRemixAndAntibirthAndAfterbirthOnwards: return 'Community Remix, Antibirth, Afterbirth Onwards';
        case ExistsIn.VanillaAndWrathOfTheLambExclusive: return 'Vanilla and Wrath of the Lamb Exclusive';
        case ExistsIn.CommunityRemixAndRebirthOnwards: return 'Community Remix, Rebirth Onwards';
        default: return '';
    }
}

const convertResourceTypeToString = (r: ResourceType): string => {
    switch (r) {
        case ResourceType.Unspecified: return 'Unspecified';
        case ResourceType.Boss: return 'Boss';
        case ResourceType.Character: return 'Playable Character';
        case ResourceType.Curse: return 'Curse';
        case ResourceType.OtherEvent: return 'Other Event';
        case ResourceType.Floor: return 'Floor';
        case ResourceType.Item: return 'Item';
        case ResourceType.ItemSource: return 'Item Source';
        case ResourceType.Pill: return 'Pill';
        case ResourceType.Rune: return 'Rune';
        case ResourceType.TarotCard: return 'Tarot Card';
        case ResourceType.Enemy: return 'Enemy';
        case ResourceType.Transformation: return 'Transformation';
        case ResourceType.Trinket: return 'Trinket';
        case ResourceType.CharacterReroll: return 'Character Reroll';
        case ResourceType.OtherConsumable: return 'Other Consumable';
        default: return '';
    }
}

const convertGameplayEventTypeToString = (e: GameplayEventType): string => {
    switch (e) {
        case GameplayEventType.AbsorbedItem: return 'Absorbed Item';
        case GameplayEventType.Bossfight: return 'Bossfight';
        case GameplayEventType.CharacterDied: return 'Death of Character';
        case GameplayEventType.CharacterReroll: return 'Character Reroll';
        case GameplayEventType.Curse: return 'Curse';
        case GameplayEventType.DownToTheNextFloor: return 'Down to the next floor';
        case GameplayEventType.ItemCollected: return 'Collected Item';
        case GameplayEventType.ItemTouched: return 'Touched Item';
        case GameplayEventType.LastFloor: return 'Last Floor';
        case GameplayEventType.LostTheRun: return 'Character lost the run';
        case GameplayEventType.OtherConsumable: return 'Other Consumable';
        case GameplayEventType.Pill: return 'Pill';
        case GameplayEventType.Rune: return 'Rune';
        case GameplayEventType.StartingTrinket: return 'Starting Trinket';
        case GameplayEventType.TarotCard: return 'Tarot Card';
        case GameplayEventType.TransformationComplete: return 'Transformation Complete';
        case GameplayEventType.TransformationProgress: return 'Transformation Progress';
        case GameplayEventType.Trinket: return 'Trinket';
        case GameplayEventType.WonTheRun: return 'Character won the run';
        case GameplayEventType.Unspecified: return 'Unspecified Event';
        default: return '';
    }
}

const convertSubmissionTypeToString = (t: SubmissionType) => {
    switch (t) {
        case SubmissionType.Lost: return 'Lost';
        case SubmissionType.New: return 'New';
        case SubmissionType.Old: return 'Old';
        case SubmissionType.Unknown: return 'Unknown';
        default: return '';
    }
}

const convertTagToString = (t: Tag): string => {
    switch (t) {
        case Tag.Unspecified: return 'Unspecified';
        case Tag.ChangesDropBehavior: return 'Changes Consumable Drop Behavior';
        case Tag.ChangesItemBehavior: return 'Changes Item Behavior';
        case Tag.ModifiesFamiliars: return 'Modifies Familiars';
        case Tag.CanSpawnFlies: return 'Can Spawn Flies';
        case Tag.CanSpawnSpiders: return 'Can Spawn Spiders';
        case Tag.DamageReduction: return 'Damage Reduction';
        case Tag.Invincibility: return 'Invincibility';
        case Tag.ChangesBombBehavior: return 'Changes Bomb Behavior';
        case Tag.RoomDamage: return 'Room Damage';
        case Tag.HpRegeneration: return 'HP Regeneration';
        case Tag.MapReveal: return 'Map Reveal';
        case Tag.TimeManipulation: return 'Time Manipulation';
        case Tag.SplashDamage: return 'Splash Damage';
        case Tag.Recharge: return 'Item Recharge';
        case Tag.BeamsFromHeaven: return 'Beams from Heaven';
        case Tag.TriggersOnGettingHit: return 'Triggers on \'Getting Hit\'';
        case Tag.GeneratesItem: return 'Can Generate Another Item';
        case Tag.DamagesSelfOnUse: return 'Self-Damage on Use';
        case Tag.SizeUp: return 'Size Up';
        case Tag.SizeDown: return 'Size Down';
        case Tag.Teleport: return 'Teleport';
        case Tag.DropsKeys: return 'Drops Keys';
        case Tag.DropsBombs: return 'Drops Bombs';
        case Tag.DropsBatteries: return 'Drops Batteries';
        case Tag.DropsRedHearts: return 'Drops Red Hearts';
        case Tag.DropsSpiritHearts: return 'Drops Spirit Hearts';
        case Tag.DropsRottenHearts: return 'Drops Rotten Hearts';
        case Tag.DropsEternalHearts: return 'Drops Eternal Hearts';
        case Tag.DropsBoneHearts: return 'Drops Bone Hearts';
        case Tag.DropsBlackHearts: return 'Drops Black Hearts';
        case Tag.DropsImmortalHearts: return 'Drops Immortal Hearts';
        case Tag.DropsTarotCards: return 'Drops Tarot Cards';
        case Tag.DropsTrinkets: return 'Drops Trinkets';
        case Tag.DropsPills: return 'Drops Pills';
        case Tag.DropsChests: return 'Drops Chests';
        case Tag.DropsSacks: return 'Drops Sacks';
        case Tag.DropsRunes: return 'Drops Runes';
        case Tag.DropsPennies: return 'Drops Pennies';
        case Tag.AddsKeys: return 'Adds Keys to Inventory';
        case Tag.AddsBombs: return 'Adds Bombs to Inventory';
        case Tag.AddsRedHearts: return 'Refills Red Hearts';
        case Tag.AddsSpiritHearts: return 'Adds Spirit Hearts';
        case Tag.AddsRottenHearts: return 'Adds Rotten Hearts';
        case Tag.AddsEternalHearts: return 'Adds Eternal Hearts';
        case Tag.AddsBoneHearts: return 'Adds Bone Hearts';
        case Tag.AddsBlackHearts: return 'Adds Black Hearts';
        case Tag.AddsImmortalHearts: return 'Adds Immortal Hearts';
        case Tag.AddsTarotCards: return 'Adds Tarot Cards to Inventory';
        case Tag.AddsTrinkets: return 'Adds Trinkets to Inventory';
        case Tag.AddsPills: return 'Adds Pills to Inventory';
        case Tag.AddsRunes: return 'Adds Runes to Inventory';
        case Tag.AddsPennies: return 'Adds Pennies to Inventory';
        case Tag.Charm: return 'Charm Effect';
        case Tag.Beam: return 'Beam Attack';
        case Tag.Poison: return 'Can Poision Enemies';
        case Tag.Slow: return 'Slow Enemies';
        case Tag.Fear: return 'Fear Effect';
        case Tag.Explosion: return 'Can cause Explosions';
        case Tag.Freeze: return 'Can Freeze Enemies';
        case Tag.Burn: return 'Can Burn Enemies';
        case Tag.Confuse: return 'Confuses Enemies';
        case Tag.Spectral: return 'Spectral Tears';
        case Tag.Homing: return 'Homing Tears';
        case Tag.Piercing: return 'Piercing Tears';
        case Tag.Shrink: return 'Shrink Enemies';
        case Tag.Bleed: return 'Bleed Attack';
        case Tag.ExtraTears: return 'Adds Additional Tears';
        case Tag.VisualTearChange: return 'Visual Tear Change / Tear Reskin';
        case Tag.ChangesDealBehavior: return 'Changes Deal with the Devil / Angel behavior';
        case Tag.ChangesTearBehavior: return 'Changes Behavior of Tears';
        case Tag.ChangesEnemyBehavior: return 'Changes Enemy Behavior';
        case Tag.Flight: return 'Grants Flight';
        case Tag.ExtraLives: return 'Extra Lives';
        case Tag.ExplosionImmunity: return 'Explosion Immunity';
        case Tag.ChargeBar: return 'Adds a Charge Bar';
        case Tag.Creep: return 'Create Creep';
        case Tag.WalkOverGaps: return 'Walk over Gaps';
        case Tag.MoreTrinketSpace: return 'More Trinket Space';
        case Tag.MoreConsumableSpace: return 'More Consumable Space';
        case Tag.CurseUp: return 'Curse Up';
        case Tag.EvilUp: return 'Evil Up';
        case Tag.EvilDown: return 'Evil Down';
        case Tag.FaithUp: return 'Faith Up';
        case Tag.FaithDown: return 'Faith Down';
        case Tag.KnockbackUp: return 'Knockback Up';
        case Tag.KnockbackDown: return 'Knockback Down';
        case Tag.TearHeightUp: return 'Tear Height Up';
        case Tag.TearHeightDown: return 'Tear Height Down';
        case Tag.SinUp: return 'Sin Up';
        case Tag.TearSizeUp: return 'Tear Size Up';
        case Tag.TearSizeDown: return 'Tear Size Down';
        case Tag.DamageUpTemporary: return 'Temporary Damage Up';
        case Tag.DamageDownTemporary: return 'Temporary Damage Down';
        case Tag.SpeedUpTemporary: return 'Temporary Speed Up';
        case Tag.SpeedDownTemporary: return 'Temporary Speed Down';
        case Tag.ShotSpeedDownTemporary: return 'Temporary Speed Down';
        case Tag.ShotSpeedUpTemporary: return 'Temporary Shot Speed Up';
        case Tag.ShotSpeedDownTemporary: return 'Temporary Shot Speed Down';
        case Tag.TearsUpTemporary: return 'Temporary Tears Up';
        case Tag.TearsDownTemporary: return 'Temporary Tears Down';
        case Tag.HealthUpTemporary: return 'Temporary Health Up';
        case Tag.HealthDownTemporary: return 'Temporary Health Down';
        case Tag.RangeUpTemporary: return 'Temporary Range Up';
        case Tag.RangeDownTemporary: return 'Temporary Range Down';
        case Tag.LuckUpTemporary: return 'Temporary Luck Up';
        case Tag.LuckDownTemporary: return 'Temporary Luck Down';
        case Tag.DamageUp: return 'Damage Up';
        case Tag.DamageDown: return 'Damage Down';
        case Tag.SpeedUp: return 'Speed Up';
        case Tag.SpeedDown: return 'Speed Down';
        case Tag.ShotSpeedUp: return 'Shot Speed Up';
        case Tag.ShotSpeedDown: return 'Shot Speed Down';
        case Tag.TearsUp: return 'Tears Up';
        case Tag.TearsDown: return 'Tears Down';
        case Tag.HealthUp: return 'Health Up';
        case Tag.HealthDown: return 'Health Down';
        case Tag.RangeUp: return 'Range Up';
        case Tag.RangeDown: return 'Range Down';
        case Tag.LuckUp: return 'Luck Up';
        case Tag.LuckDown: return 'Luck Down';
        case Tag.RandomizesStats: return 'Randomizes Stats';
        case Tag.DamageMultiplier: return 'Damage Multiplier';
        case Tag.CanRerollItemPedestals: return 'Can Reroll Items on Item Pedestals';
        case Tag.CanRerollPickups: return 'Can Reroll Consumables';
        case Tag.CanRerollCharacter: return 'Can Reroll your Character';
        case Tag.CanRerollRocks: return 'Can Reroll Rocks';
        case Tag.CanRerollStats: return 'Can Reroll Stats';
        case Tag.CanRerollFloor: return 'Can Reroll the Floor';
        case Tag.CanRerollEnemies: return 'Can Reroll Enemies';
        case Tag.CanRerollRoom: return 'Can Reroll current Room';
        case Tag.Aura: return 'Grants an Aura Effect';
        case Tag.RemovesCurse: return 'Removes Curses';
        case Tag.AddsCurse: return 'Adds a Curse';
        case Tag.SpawnsFamiliarOrOrbital: return 'Can Spawn a Familiar or an Orbital';
        case Tag.SpikeImmunity: return 'Spike Immunity';
        case Tag.RandomStatusEffect: return 'Can add a Random Status Effect';
        case Tag.ChangesChestBehavior: return 'Changes Behavior of Chests';
        case Tag.HasRandomEffect: return 'Effect depends on RNG';
        case Tag.CrushesRocks: return 'Can Crush Rocks';
        case Tag.IsSpacebarItem: return 'Item is a Spacebar Item';
        case Tag.IsPassiveItem: return 'Item is a Passive Item';
        case Tag.IsFamiliar: return 'Item is a Familiar';
        case Tag.DoubleTroubleBossfight: return 'Bossfight is Double Trouble';
        case Tag.NormalBossfight: return 'Is a Regular Bossfight';
        case Tag.GoodPill: return 'Is a Good Pill';
        case Tag.BadPill: return 'Is a Bad Pill';
        case Tag.ThreeStepsToTransformation: return 'Transformation requires 3 Steps';
        case Tag.TwoStepsToTransform: return 'Transformation requires 2 Steps';
        case Tag.AbsorbsOtherItems: return 'Absorbs other Items';
        case Tag.AppearsOnBasementOne: return 'Appears on Basement 1';
        case Tag.AppearsOnBasementTwo: return 'Appears on Basement 2';
        case Tag.AppearsOnBasementXl: return 'Appears on Basement XL';
        case Tag.AppearsOnCellarOne: return 'Appears on Cellar 1';
        case Tag.AppearsOnCellarTwo: return 'Appears on Cellar 2';
        case Tag.AppearsOnCellarXl: return 'Appears on Cellar XL';
        case Tag.AppearsOnBurningBasementOne: return 'Appears on Burning Basement 1';
        case Tag.AppearsOnBurningBasementTwo: return 'Appears on Burning Basement 2';
        case Tag.AppearsOnBurningBasementXl: return 'Appears on Burning Basement XL';
        case Tag.AppearsOnBlueWomb: return 'Appears on ??? (Blue Womb)';
        case Tag.AppearsOnCatacombsOne: return 'Appears on Catacombs 1';
        case Tag.AppearsOnCatacombsTwo: return 'Appears on Catacombs 2';
        case Tag.AppearsOnCatacombsXl: return 'Appears on Catacombs XL';
        case Tag.AppearsOnCathedral: return 'Appears on Cathedral';
        case Tag.AppearsOnCavesOne: return 'Appears on Caves 1';
        case Tag.AppearsOnCavesTwo: return 'Appears on Caves 2';
        case Tag.AppearsOnCavesXl: return 'Appears on Caves XL';
        case Tag.AppearsOnChest: return 'Appears on The Chest';
        case Tag.AppearsOnCorpseOne: return 'Appears on Corpse 1';
        case Tag.AppearsOnCorpseTwo: return 'Appears on Corpse 2';
        case Tag.AppearsOnCorpseXl: return 'Appears on Corpse XL';
        case Tag.AppearsOnDankDepthsOne: return 'Appears on Dank Depths 1';
        case Tag.AppearsOnDankDepthsTwo: return 'Appears on Dank Depths 2';
        case Tag.AppearsOnDankDepthsXl: return 'Appears on Dank Depths XL';
        case Tag.AppearsOnDarkRoom: return 'Appears on Dark Room';
        case Tag.AppearsOnDepthsOne: return 'Appears on Depths 1';
        case Tag.AppearsOnDepthsTwo: return 'Appears on Depths 2';
        case Tag.AppearsOnDepthsXl: return 'Appears on Depths XL';
        case Tag.AppearsOnDownpourOne: return 'Appears on Downpour 1';
        case Tag.AppearsOnDownpourTwo: return 'Appears on Downpour 2';
        case Tag.AppearsOnDownpourXl: return 'Appears on Downpour XL';
        case Tag.AppearsOnFloodedCavesOne: return 'Appears on Flooded Caves 1';
        case Tag.AppearsOnFloodedCavesTwo: return 'Appears on Flooded Caves 2';
        case Tag.AppearsOnFloodedCavesXl: return 'Appears on Flooded Caves XL';
        case Tag.AppearsOnGreedModeBasement: return 'Appears on Greed Mode - Basement';
        case Tag.AppearsOnGreedModeCaves: return 'Appears on Greed Mode - Caves';
        case Tag.AppearsOnGreedModeDepths: return 'Appears on Greed Mode - Depths';
        case Tag.AppearsOnGreedModeSheol: return 'Appears on Greed Mode - Sheol';
        case Tag.AppearsOnGreedModeTheShop: return 'Appears on Greed Mode - The Shop';
        case Tag.AppearsOnGreedModeUltraGreed: return 'Appears on Greed Mode - Ultra Greed';
        case Tag.AppearsOnGreedModeWomb: return 'Appears on Greed Mode - The Womb';
        case Tag.AppearsOnMausoleumOne: return 'Appears on Mausoleum 1';
        case Tag.AppearsOnMausoleumTwo: return 'Appears on Mausoleum 2';
        case Tag.AppearsOnMausoleumXl: return 'Appears on Mausoleum XL';
        case Tag.AppearsOnMinesOne: return 'Appears on Mines 1';
        case Tag.AppearsOnMinesTwo: return 'Appears on Mines 2';
        case Tag.AppearsOnMinesXl: return 'Appears on Mines XL';
        case Tag.AppearsOnNecropolisOne: return 'Appears on Necropolis 1';
        case Tag.AppearsOnNecropolisTwo: return 'Appears on Necropolis 2';
        case Tag.AppearsOnNecropolisXl: return 'Appears on Necropolis XL';
        case Tag.AppearsOnScarredWombOne: return 'Appears on Scarred Womb 1';
        case Tag.AppearsOnScarredWombTwo: return 'Appears on Scarred Womb 2';
        case Tag.AppearsOnScarredWombXl: return 'Appears on Scarred Womb XL';
        case Tag.AppearsOnSheol: return 'Appears on Sheol';
        case Tag.AppearsOnTheVoid: return 'Appears on the Void';
        case Tag.AppearsOnUteroOne: return 'Appears on Utero 1';
        case Tag.AppearsOnUteroTwo: return 'Appears on Utero 2';
        case Tag.AppearsOnUteroXl: return 'Appears on Utero XL';
        case Tag.AppearsOnWombOne: return 'Appears on Womb 1';
        case Tag.AppearsOnWombTwo: return 'Appears on Womb 2';
        case Tag.AppearsOnWombXl: return 'Appears on Womb XL';
        case Tag.ComesAfterBasementOne: return 'Comes After Basement 1';
        case Tag.ComesAfterBasementTwo: return 'Comes After Basement 2';
        case Tag.ComesAfterBasementXl: return 'Comes After Basement XL';
        case Tag.ComesAfterCellarOne: return 'Comes After Cellar 1';
        case Tag.ComesAfterCellarTwo: return 'Comes After Cellar 2';
        case Tag.ComesAfterCellarXl: return 'Comes After Cellar XL';
        case Tag.ComesAfterBurningBasementOne: return 'Comes After Burning Basement 1';
        case Tag.ComesAfterBurningBasementTwo: return 'Comes After Burning Basement 2';
        case Tag.ComesAfterBurningBasementXl: return 'Comes After Burning Basement XL';
        case Tag.ComesAfterBlueWomb: return 'Comes After ??? (Blue Womb)';
        case Tag.ComesAfterCatacombsOne: return 'Comes After Catacombs 1';
        case Tag.ComesAfterCatacombsTwo: return 'Comes After Catacombs 2';
        case Tag.ComesAfterCatacombsXl: return 'Comes After Catacombs XL';
        case Tag.ComesAfterCathedral: return 'Comes After Cathedral';
        case Tag.ComesAfterCavesOne: return 'Comes After Caves 1';
        case Tag.ComesAfterCavesTwo: return 'Comes After Caves 2';
        case Tag.ComesAfterCavesXl: return 'Comes After Caves XL';
        case Tag.ComesAfterChest: return 'Comes After The Chest';
        case Tag.ComesAfterCorpseOne: return 'Comes After Corpse 1';
        case Tag.ComesAfterCorpseTwo: return 'Comes After Corpse 2';
        case Tag.ComesAfterCorpseXl: return 'Comes After Corpse XL';
        case Tag.ComesAfterDankDepthsOne: return 'Comes After Dank Depths 1';
        case Tag.ComesAfterDankDepthsTwo: return 'Comes After Dank Depths 2';
        case Tag.ComesAfterDankDepthsXl: return 'Comes After Dank Depths XL';
        case Tag.ComesAfterDarkRoom: return 'Comes After Dark Room';
        case Tag.ComesAfterDepthsOne: return 'Comes After Depths 1';
        case Tag.ComesAfterDepthsTwo: return 'Comes After Depths 2';
        case Tag.ComesAfterDepthsXl: return 'Comes After Depths XL';
        case Tag.ComesAfterDownpourOne: return 'Comes After Downpour 1';
        case Tag.ComesAfterDownpourTwo: return 'Comes After Downpour 2';
        case Tag.ComesAfterDownpourXl: return 'Comes After Downpour XL';
        case Tag.ComesAfterFloodedCavesOne: return 'Comes After Flooded Caves 1';
        case Tag.ComesAfterFloodedCavesTwo: return 'Comes After Flooded Caves 2';
        case Tag.ComesAfterFloodedCavesXl: return 'Comes After Flooded Caves XL';
        case Tag.ComesAfterGreedModeBasement: return 'Comes After Greed Mode - Basement';
        case Tag.ComesAfterGreedModeCaves: return 'Comes After Greed Mode - Caves';
        case Tag.ComesAfterGreedModeDepths: return 'Comes After Greed Mode - Depths';
        case Tag.ComesAfterGreedModeSheol: return 'Comes After Greed Mode - Sheol';
        case Tag.ComesAfterGreedModeTheShop: return 'Comes After Greed Mode - The Shop';
        case Tag.ComesAfterGreedModeUltraGreed: return 'Comes After Greed Mode - Ultra Greed';
        case Tag.ComesAfterGreedModeWomb: return 'Comes After Greed Mode - The Womb';
        case Tag.ComesAfterMausoleumOne: return 'Comes After Mausoleum 1';
        case Tag.ComesAfterMausoleumTwo: return 'Comes After Mausoleum 2';
        case Tag.ComesAfterMausoleumXl: return 'Comes After Mausoleum XL';
        case Tag.ComesAfterMinesOne: return 'Comes After Mines 1';
        case Tag.ComesAfterMinesTwo: return 'Comes After Mines 2';
        case Tag.ComesAfterMinesXl: return 'Comes After Mines XL';
        case Tag.ComesAfterNecropolisOne: return 'Comes After Necropolis 1';
        case Tag.ComesAfterNecropolisTwo: return 'Comes After Necropolis 2';
        case Tag.ComesAfterNecropolisXl: return 'Comes After Necropolis XL';
        case Tag.ComesAfterScarredWombOne: return 'Comes After Scarred Womb 1';
        case Tag.ComesAfterScarredWombTwo: return 'Comes After Scarred Womb 2';
        case Tag.ComesAfterScarredWombXl: return 'Comes After Scarred Womb XL';
        case Tag.ComesAfterSheol: return 'Comes After Sheol';
        case Tag.ComesAfterTheVoid: return 'Comes After the Void';
        case Tag.ComesAfterUteroOne: return 'Comes After Utero 1';
        case Tag.ComesAfterUteroTwo: return 'Comes After Utero 2';
        case Tag.ComesAfterUteroXl: return 'Comes After Utero XL';
        case Tag.ComesAfterWombOne: return 'Comes After Womb 1';
        case Tag.ComesAfterWombTwo: return 'Comes After Womb 2';
        case Tag.ComesAfterWombXl: return 'Comes After Womb XL';
        case Tag.TemporarySizeDown: return 'Temporary Size Down';
        case Tag.TemporarySizeUp: return 'Temporary Size Up';
        case Tag.SingleUse: return 'Single Use Item';
        case Tag.DropsRandomConsumables: return 'Drops Random Consumables';
        case Tag.SpawnsTrollBombs: return 'Spawns Troll Bombs';
        case Tag.IsOrbital: return 'Is an Orbital';
        case Tag.TargetsOrHomesInOnEnemies: return 'Auto-targets or homes in on enemies';
        case Tag.ContactDamage: return 'Deals Contact Damage';
        case Tag.BlocksEnemyShots: return 'Blocks Enemy Shots';
        case Tag.SpawnsFire: return 'Spawns Fire';
        case Tag.ModifiesDealChance: return 'Modifies Angel/Devil Deal Chances';
        case Tag.IsFirstFloor: return 'Is First Floor';
        default: return '';
    }
}

export {
    convertGameModeToString,
    convertExistsInToString,
    convertResourceTypeToString,
    convertTagToString,
    convertGameplayEventTypeToString,
    convertSubmissionTypeToString
}

