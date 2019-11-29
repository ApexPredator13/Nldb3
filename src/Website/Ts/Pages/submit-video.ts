import { HistoryTable, removeHistoryElement } from "../Components/SubmitVideo/history-table";
import { WhatCharacterWasChosen } from "../Components/SubmitVideo/m-what-character-was-chosen";
import { WhatGameModeWasChosen } from "../Components/SubmitVideo/m-what-game-mode-was-played";
import { SubmitQuote } from "../Components/SubmitVideo/submit-quote";
import { SubmitTopic } from "../Components/SubmitVideo/submit-topic";
import { YoutubePlayer } from "../Components/SubmitVideo/youtube-player";
import { GameMode } from "../Enums/game-mode";
import { ResourceType } from "../Enums/resource-type";
import { addClassIfNotExists, removeClassIfExists } from "../Framework/browser";
import { getConfig } from "../Framework/Customizable/config.development";
import { get } from "../Framework/http";
import { A, Component, EventType, FrameworkElement, render } from "../Framework/renderer";
import { PageData, registerPage } from "../Framework/router";
import { IsaacResource } from "../Models/isaac-resource";
import { SubmittedPlayedCharacter } from "../Models/submitted-played-character";
import { SubmittedPlayedFloor } from "../Models/submitted-played-floor";
import { Tag } from "../Enums/tags";
import { WhatFloorAreWeOn } from "../Components/SubmitVideo/m-what-floor-are-we-on";
import { SubmittedGameplayEvent } from "../Models/submitted-gameplay-event";
import { WasTheFloorCursed } from "../Components/SubmitVideo/m-was-the-floor-cursed";
import { GameplayEventType } from "../Enums/gameplay-event-type";
import { DidNlShowTheSeed } from "../Components/SubmitVideo/m-did-nl-show-the-seed";
import { MainSelectScreen } from "../Components/SubmitVideo/m-main-select-screen";
import { WhereDidTheItemComeFrom } from "../Components/SubmitVideo/m-where-did-the-item-come-from";
import { WhatItemWasCollected } from "../Components/SubmitVideo/m-what-item-was-collected";
import { HowWasTheItemAbsorbed } from "../Components/SubmitVideo/m-how-was-the-item-absorbed";
import { WhatBossWasFought } from "../Components/SubmitVideo/m-what-boss-was-fought";
import { SelectWhatTrinketWasTaken } from "../Components/SubmitVideo/m-select-what-trinket-was-taken";
import { SelectHowWasTheCharacterRerolled } from "../Components/SubmitVideo/m-select-how-was-the-character-rerolled";
import { SelectWhatKilledNl } from "../Components/SubmitVideo/m-select-what-killed-nl";
import { ConfirmNlDied } from "../Components/SubmitVideo/m-confirm-nl-died";
import { DidNlDoAnotherRun } from "../Components/SubmitVideo/m-did-nl-do-another-run";
import { ConfirmNlDidAVictoryLap } from "../Components/SubmitVideo/m-confirm-nl-did-a-victory-lap";
import { ConfirmTheRunEnded } from "../Components/SubmitVideo/m-confirm-the-run-ended";
import { ConfirmSubmitEpisode } from "../Components/SubmitVideo/m-confirm-submit-episode";
import { SubmissionSucceeded } from "../Components/SubmitVideo/SubmissionSucceeded";
import { ConfirmNlWon } from "../Components/SubmitVideo/m-confirm-nl-won";
import { ConfirmDidNlDoAnotherRun } from "../Components/SubmitVideo/m-confirm-did-nl-do-another-run";

enum StaticResourcesForMenu {
    MajorGameplayEvents = 1,
    UsedConsumables,
    GameModes,
    NoStartingItems,
    NoStartingTrinkets,
    MoreStartingItems,
    MoreStartingTrinkets,
    ConfirmNlDied,
    ConfirmNlWon,
    CommonBosses,
    NextFloorset,
    WasThereAnotherRun,
    SubmitFailed,
    RunSubmittedSuccessfully,
    DidBlackRuneAbsorbAnItem,
    DidBlackRuneAbsorbAnotherItem,
    NoCurse,
    ConfirmVictoryLap,
    ConfirmRunEnded,
    ConfirmAnotherRun
}

export class SubmitVideo implements Component {
    E: FrameworkElement;

    private history: HistoryTable<SubmitVideo>;
    private currentPlayer: 1 | 2;
    private storedServerResources: Map<string, Array<IsaacResource>>;
    private staticResources: Map<StaticResourcesForMenu, Array<IsaacResource>>;
    private youtubePlayer: YoutubePlayer;
    private videoId: string;

    private rightColumn: HTMLDivElement | undefined;

    private tempChosenCharacterId: string | undefined;
    private tempChosenItemSource: string | undefined;
    private wasRerolled = false;

    private initialMenu: WhatCharacterWasChosen<SubmitVideo>;

    constructor(parameters: Array<string>) {
        this.videoId = parameters[0];
        const origin = getConfig().baseUrlWithoutTrailingSlash;
        this.youtubePlayer = new YoutubePlayer();
        this.history = new HistoryTable<SubmitVideo>(this, this.videoId, this.ItemWasRemovedFromHistory, this.youtubePlayer);
        this.currentPlayer = 1;
        this.storedServerResources = new Map<string, Array<IsaacResource>>();
        this.staticResources = new Map<StaticResourcesForMenu, Array<IsaacResource>>();
        this.CreateInitialStaticResources();
        this.initialMenu = new WhatCharacterWasChosen(this, this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Character.toString(10)}`), this.CharacterWasChosen);

        this.E = {
            e: ['div'],
            a: [[A.Id, 'menu-wrapper']],
            c: [
                {
                    e: ['div'],
                    a: [[A.Id, 'left-column']],
                    c: [
                        {
                            e: ['div'],
                            a: [[A.Id, 'youtube-player-container']],
                            c: [
                                {
                                    e: ['iframe'],
                                    a: [
                                        [A.Id, 'ytplayer'],
                                        [A.Src, `https://www.youtube.com/embed/${this.videoId}?enablejsapi=1&origin=${origin}&rel=0&autoplay=1`],
                                        [A.FrameBorder, '0']
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['div'],
                            a: [[A.Id, 'quotes-and-topic-wrapper']],
                            c: [
                                new SubmitQuote(this.videoId, this.youtubePlayer),
                                new SubmitTopic(this.videoId),
                                this.history
                            ]
                        }
                    ]
                },
                {
                    e: ['div'],
                    a: [[A.Id, 'right-column']],
                    c: [
                        this.initialMenu
                    ]
                },
                {
                    e: ['div', '1'],
                    a: [[A.Id, 'current-player-container'], [A.Class, 'hand']],
                    v: [[EventType.Click, e => this.ChangePlayer(e)]]
                }
            ]
        }
    }

    
    private ItemWasRemovedFromHistory(removedElement: removeHistoryElement) {
        // user has confirmed that the character must be removed, and the history element already removed it.
        // ask the user to select a character again
        if (removedElement.characterIndex !== null && removedElement.floorIndex === null && removedElement.eventIndex === null) {
            this.Display(this.initialMenu);
            return;
        }

        // user has confirmed that a floor must be removed, and the history element already removed the floor.
        // ask the user to select a floor again
        if (removedElement.characterIndex !== null && removedElement.floorIndex !== null && removedElement.eventIndex === null) {
            this.ShowChooseFloor();
            return;
        }

        // generic events are safe to remove, except for the curse. here the 'select curse' menu must be displayed again
        if (removedElement.characterIndex !== null && removedElement.floorIndex !== null && removedElement.eventIndex !== null && removedElement.eventType !== null) {
            if (removedElement.eventType === ResourceType.Curse) {
                this.ShowWasTheFloorCursed();
                return;
            }
        }
    }

    private ChangePlayer(e: Event) {
        const target = e.target;
        if (target && target instanceof HTMLDivElement && target.id === 'current-player-container') {
            if (target.innerText === '1') {
                addClassIfNotExists(target, 'change-player-container-modifier');
                this.currentPlayer = 2;
                target.innerText = '2'
            } else {
                removeClassIfExists(target, 'change-player-container-modifier');
                this.currentPlayer = 1;
                target.innerText = '1';
            }
        }
    }

    private Display(component: Component) {
        const html = render(component);
        if (html) {
            const menuContainer = this.getRightColumn();
            menuContainer.innerHTML = '';
            menuContainer.appendChild(html);
        }
    }

    private getRightColumn() {
        if (this.rightColumn) {
            return this.rightColumn;
        }

        const rightColumn = document.getElementById('right-column');
        if (!rightColumn || !(rightColumn instanceof HTMLDivElement)) {
            throw 'right column does not exist';
        }

        this.rightColumn = rightColumn;
        return rightColumn;
    }

    private CreateInitialStaticResources() {
        this.staticResources.set(StaticResourcesForMenu.MajorGameplayEvents, [
            { id: GameplayEventType.ItemCollected.toString(10), name: 'Item Collected', x: 70, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.ItemTouched.toString(10), name: 'Item Touched', x: 595, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.Bossfight.toString(10), name: 'Bossfight', x: 140, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.Trinket.toString(10), name: 'Trinket Taken', x: 280, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.CharacterReroll.toString(10), name: 'Character Reroll', x: 385, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.AbsorbedItem.toString(10), name: 'Sucked Up Item', x: 350, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.CharacterDied.toString(10), name: 'Northernlion DIED', x: 35, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.WonTheRun.toString(10), name: 'Northernlion WON', x: 1155, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.DownToTheNextFloor.toString(10), name: 'Down to the next floor!', x: 105, y: 0, w: 35, h: 35 } as IsaacResource
        ]);

        this.staticResources.set(StaticResourcesForMenu.UsedConsumables, [
            { id: GameplayEventType.Pill.toString(10), name: 'Pill', x: 175, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.TarotCard.toString(10), name: 'Tarot Card', x: 210, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.Rune.toString(10), name: 'Rune', x: 245, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.OtherConsumable.toString(10), name: 'Other Consumable', x: 315, y: 0, w: 35, h: 35 } as IsaacResource
        ]);

        this.staticResources.set(StaticResourcesForMenu.GameModes, [
            { id: GameMode.HardAndNormal.toString(10), name: 'Normal Game', x: 840, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameMode.GreedAndGreedier.toString(10), name: 'Greed Mode!', x: 875, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameMode.SpecialChallenge.toString(10), name: 'A Special Challenge', x: 910, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameMode.CommunityChallenge.toString(10), name: 'Community-Requested Challenge', x: 980, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameMode.SpecialSeed.toString(10), name: 'A Special Seed', x: 945, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameMode.Unspecified.toString(10), name: 'Something else / from a mod', x: 1015, y: 0, w: 35, h: 35 } as IsaacResource
        ]);

        this.staticResources.set(StaticResourcesForMenu.NoStartingItems, [
            { id: 'none', name: 'No, continue!', x: 700, y: 0, w: 35, h: 35 } as IsaacResource,
        ]);

        this.staticResources.set(StaticResourcesForMenu.NoStartingTrinkets, [
            { id: 'none', name: 'No, continue!', x: 665, y: 0, w: 35, h: 35 } as IsaacResource,
        ]);
        this.staticResources.set(StaticResourcesForMenu.MoreStartingItems, [
            { id: 'yes', name: 'Yes, there were more!', x: 595, y: 0, w: 30, h: 30 } as IsaacResource,
            { id: 'no', name: 'No, that was it!', x: 700, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.MoreStartingTrinkets, [
            { id: 'yes', name: 'Yes, there was another trinket!', x: 280, y: 0, w: 30, h: 30 } as IsaacResource,
            { id: 'no', name: 'No, that was it!', x: 665, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.CommonBosses, []);
        this.staticResources.set(StaticResourcesForMenu.NextFloorset, []);
        this.staticResources.set(StaticResourcesForMenu.ConfirmNlDied, [
            { id: 'confirm', name: 'Yes, NL died!', x: 1050, y: 0, w: 35, h: 30 } as IsaacResource,
            { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.ConfirmVictoryLap, [
            { id: 'confirm', name: 'Yes, NL did a victory lap!', x: 1050, y: 0, w: 35, h: 30 } as IsaacResource,
            { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.ConfirmAnotherRun, [
            { id: 'confirm', name: 'Yes, NL did another run!', x: 1050, y: 0, w: 35, h: 30 } as IsaacResource,
            { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.ConfirmRunEnded, [
            { id: 'confirm', name: 'Yes, The video ended here!', x: 1050, y: 0, w: 35, h: 30 } as IsaacResource,
            { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.ConfirmNlWon, [
            { id: 'confirm', name: 'Yes, NL won the run!', x: 1050, y: 0, w: 35, h: 30 } as IsaacResource,
            { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.WasThereAnotherRun, [
            { id: 'run', name: 'Yes, another run!', x: 1120, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'victory-lap', name: 'Yes, a victory lap!', x: 1120, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'end', name: 'No, the episode ended here!', x: 1050, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.SubmitFailed, [
            { id: 'submit-episode', name: 'Submit Episode!', x: 1120, y: 0, w: 30, h: 30 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.RunSubmittedSuccessfully, [
            { id: 'run-submitted', name: 'View Results!', x: 735, y: 0, w: 30, h: 30 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.DidBlackRuneAbsorbAnItem, [
            { id: 'no', name: 'It didn\'t absorb abything, move on!', x: 0, y: 0, w: 30, h: 30 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.DidBlackRuneAbsorbAnotherItem, [
            { id: 'yes', name: 'Yes, more items were absorbed!', x: 0, y: 0, w: 30, h: 30 } as IsaacResource,
            { id: 'no', name: 'No, that was it!', x: 0, y: 0, w: 30, h: 30 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.NoCurse, [
            { id: 'NoCurse', name: 'No Curse!', x: 735, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
    }

    private GetStaticResource(type: StaticResourcesForMenu): Array<IsaacResource> {
        const staticResources = this.staticResources.get(type);
        if (!staticResources) {
            throw `static resource is missing: ${type.toString(10)}`
        }
        return staticResources;
    }

    private async GetServerResource(url: string): Promise<Array<IsaacResource> | null> {
        const storedResources = this.storedServerResources.get(url);
        if (storedResources) {
            return storedResources;
        }

        const loadedResources = await get<Array<IsaacResource>>(url);

        if (loadedResources) {
            this.storedServerResources.set(url, loadedResources);
        }

        return loadedResources;
    }

    private ProcessMainSelectScreenSelection(selectedEvent: string) {
        if (!selectedEvent) {
            this.ShowMainSelectScreen();
            return;
        }

        const selection = parseInt(selectedEvent, 10);
        if (isNaN(selection)) {
            this.ShowMainSelectScreen();
            return;
        }

        const gameplayEvent = selection as GameplayEventType;

        switch (gameplayEvent) {
            case GameplayEventType.ItemCollected: this.ShowWhereDidTheItemComeFrom(); break;
            case GameplayEventType.ItemTouched: this.ShowWhereDidTheTouchedItemComeFrom(); break;
            case GameplayEventType.AbsorbedItem: this.ShowHowWasTheItemAbsorbed(); break;
            case GameplayEventType.Bossfight: this.ShowSelectBoss(); break;
            case GameplayEventType.Trinket: this.SelectTrinket(); break;
            case GameplayEventType.CharacterReroll: this.ShowHowWasTheCharacterRerolled(); break;
            case GameplayEventType.CharacterDied: this.ShowConfirmNlDied(); break;
            case GameplayEventType.WonTheRun: this.ShowConfirmNlWon(); break;
            case GameplayEventType.DownToTheNextFloor: this.ShowChooseFloor(); break;
        }
    }

    private ShowConfirmNlWon() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.ConfirmNlWon);
        const menu = new ConfirmNlWon(this, this.NlWonConfirmed, icons);
        this.Display(menu);
    }

    private NlWonConfirmed(choice: string) {
        if (choice === 'confirm') {
            this.ShowDidNlDoAnotherRun();
        } else {
            this.ShowMainSelectScreen();
        }
    }

    private ShowConfirmNlDied() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.ConfirmNlDied);
        const menu = new ConfirmNlDied(this, this.ShowWhatKilledNl, icons);
        this.Display(menu);
    }

    private ShowWhatKilledNl(choice: string) {
        if (choice === 'confirm') {
            const enemies = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Enemy.toString(10)}`);
            const menu = new SelectWhatKilledNl(this, this.EnemyWasSelected, enemies);
            this.Display(menu);
        } else {
            this.ShowMainSelectScreen();
        }
    }

    private EnemyWasSelected(enemyId: string) {
        if (!enemyId) {
            this.ShowMainSelectScreen();
            return;
        }

        this.history.AddEvent({
            EventType: GameplayEventType.CharacterDied,
            RelatedResource1: enemyId
        });

        this.ShowDidNlDoAnotherRun();
    }

    private ShowDidNlDoAnotherRun() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.WasThereAnotherRun);
        const menu = new DidNlDoAnotherRun(this, this.DidNlDoAnotherRunChoiceSelected, icons);
        this.Display(menu);
    }

    private DidNlDoAnotherRunChoiceSelected(choice: string) {
        if (choice === 'victory-lap') {
            this.ShowConfirmNlDidAVictoryLap();
        } else if (choice === 'run') {
            this.ShowConfirmNlDidAnotherRun();
        } else {
            this.ShowConfirmRunEnded();
        }
    }

    private ShowConfirmNlDidAnotherRun() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.ConfirmAnotherRun);
        const menu = new ConfirmDidNlDoAnotherRun(this, this.ConfirmDidNlDoAnotherRun, icons);
        this.Display(menu);
    }

    private ConfirmDidNlDoAnotherRun(choice: string) {
        if (choice === 'confirm') {
            this.ShowWhatCharacterWasChosenNext();
        } else {
            this.ShowDidNlDoAnotherRun();
        }
    }

    private ShowConfirmNlDidAVictoryLap() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.ConfirmVictoryLap);
        const menu = new ConfirmNlDidAVictoryLap(this, this.VictoryLapConfirmation, icons);
        this.Display(menu);
    }

    private VictoryLapConfirmation(choice: string) {
        if (choice === 'confirm') {
            this.ShowChooseFloor();
        } else {
            this.ShowDidNlDoAnotherRun();
        }
    }

    private ShowWhatCharacterWasChosenNext() {
        const characters = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Character.toString(10)}`);
        const menu = new WhatCharacterWasChosen(this, characters, this.CharacterWasChosen);
        this.Display(menu);
    }

    private ShowConfirmRunEnded() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.ConfirmRunEnded)
        const menu = new ConfirmTheRunEnded(this, this.ConfirmRunEndedChosen, icons);
        this.Display(menu);
    }

    private ConfirmRunEndedChosen(choice: string) {
        if (choice === 'confirm') {
            this.ShowSubmitEpisode();
        } else {
            this.ShowDidNlDoAnotherRun();
        }
    }

    private ShowSubmitEpisode() {
        const menu = new ConfirmSubmitEpisode(this, this.RunSubmissionDone, this.history, false);
        this.Display(menu);
    }

    private RunSubmissionDone(runSubmitted: boolean) {
        if (runSubmitted) {
            this.ShowSubmissionSucceeded();
        } else {
            this.ShowSubmissionFailed();
        }
    }

    private ShowSubmissionFailed() {
        const menu = new ConfirmSubmitEpisode(this, this.RunSubmissionDone, this.history, true);
        this.Display(menu);
    }

    private ShowSubmissionSucceeded() {
        const menu = new SubmissionSucceeded(this.videoId);
        this.Display(menu);
    }

    private ShowHowWasTheCharacterRerolled() {
        const characterRerollOptions = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.CharacterReroll.toString(10)}`);
        const menu = new SelectHowWasTheCharacterRerolled(this, this.CharacterRerollWasSelected, characterRerollOptions);
        this.Display(menu);
    }

    private CharacterRerollWasSelected(rerollId: string) {
        if (!rerollId) {
            this.ShowMainSelectScreen();
            return;
        }

        this.history.AddEvent({
            EventType: GameplayEventType.CharacterReroll,
            RelatedResource1: rerollId,
            Player: this.currentPlayer
        });

        this.ShowMainSelectScreen();
    }

    private SelectTrinket() {
        const trinkets = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Trinket.toString(10)}`);
        const menu = new SelectWhatTrinketWasTaken(this, this.TrinketWasSelected, trinkets);
        this.Display(menu);
    }

    private TrinketWasSelected(trinketId: string) {
        if (!trinketId) {
            this.ShowMainSelectScreen();
            return;
        }

        this.history.AddEvent({
            EventType: GameplayEventType.Trinket,
            RelatedResource1: trinketId,
            Player: this.currentPlayer
        });
        this.ShowMainSelectScreen();
    }

    private ShowSelectBoss() {
        const commonBosses = this.GetStaticResource(StaticResourcesForMenu.CommonBosses);
        const bosses = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Boss.toString(10)}`);
        const menu = new WhatBossWasFought(this, this.BossfightWasSelected, commonBosses, bosses, this.youtubePlayer);
        this.Display(menu);
    }

    private BossfightWasSelected(bossId: string) {
        if (!bossId) {
            this.ShowMainSelectScreen();
            return;
        }

        this.history.AddEvent({
            EventType: GameplayEventType.Bossfight,
            RelatedResource1: bossId
        });
        this.ShowMainSelectScreen();
    }

    private ShowHowWasTheItemAbsorbed() {
        const absorbers = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Unspecified.toString(10)}&RequiredTags=${Tag.AbsorbsOtherItems.toString(10)}`);
        const menu = new HowWasTheItemAbsorbed<SubmitVideo>(this, this.ShowWhatItemWasAbsorbed, absorbers);
        this.Display(menu);
    }

    private ShowWhatItemWasAbsorbed(absorberId: string) {
        if (!absorberId) {
            this.ShowMainSelectScreen();
            return;
        }

        this.tempChosenItemSource = absorberId;
        const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item.toString(10)}`);
        const menu = new WhatItemWasCollected<SubmitVideo>(this, items, this.AbsorberAndAbsorbedItemWereSelected, this.ItemWasRerolled, this.youtubePlayer, false, true);
        this.Display(menu);
    }

    private AbsorberAndAbsorbedItemWereSelected(absorbedItemId: string) {
        if (!absorbedItemId || !this.tempChosenItemSource) {
            this.ShowMainSelectScreen();
            return;
        }

        this.history.AddEvent({
            RelatedResource1: absorbedItemId,
            RelatedResource2: this.tempChosenItemSource,
            EventType: GameplayEventType.AbsorbedItem,
            Player: this.currentPlayer,
            Rerolled: this.wasRerolled
        });
        this.ShowMainSelectScreen();
    }

    private CharacterWasChosen(id: string) {
        // save chosen character temporarily: need seed and game mode. character will be saved after game mode was chosen also
        this.tempChosenCharacterId = id;    
        this.ShowChooseGameMode();
    }

    private ShowChooseGameMode() {
        const gameModeComponent = new WhatGameModeWasChosen<SubmitVideo>(this, this.GetStaticResource(StaticResourcesForMenu.GameModes), this.GameModeWasChosen);
        this.Display(gameModeComponent);
    }

    private GameModeWasChosen(gameMode: string) {
        // character must be chosen before selecting game mode, re-render selection if necessary
        if (!this.tempChosenCharacterId) {
            this.Display(this.initialMenu);
            return;
        }

        // save character
        const mode = parseInt(gameMode, 10) as GameMode;
        const chosenCharacter: SubmittedPlayedCharacter = {
            CharacterId: this.tempChosenCharacterId,
            GameMode: mode,
            Seed: undefined,
            PlayedFloors: new Array<SubmittedPlayedFloor>()
        }
        this.history.AddCharacter(chosenCharacter);

        // next: choose what floor we started on
        this.ShowChooseFirstFloor();
    }

    private ShowChooseFloor() {
        const commonFloorsThatComeNext = this.GetStaticResource(StaticResourcesForMenu.NextFloorset);
        const allFloors = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Floor.toString(10)}`);
        this.Display(new WhatFloorAreWeOn<SubmitVideo>(this, Promise.resolve(commonFloorsThatComeNext), allFloors, this.FloorWasChosen, false));
    }

    private ShowChooseFirstFloor() {
        const firstFloors = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Floor.toString(10)}&RequiredTags=${Tag.IsFirstFloor.toString(10)}`);
        const allFloors = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Floor.toString(10)}`);
        this.Display(new WhatFloorAreWeOn<SubmitVideo>(this, firstFloors, allFloors, this.FloorWasChosen, true));
    }

    private FloorWasChosen(floorId: string) {
        this.history.AddFloor({
            Duration: null,
            FloorId: floorId,
            GameplayEvents: new Array<SubmittedGameplayEvent>()
        });
        this.ShowWasTheFloorCursed();

        // now that we know the floor, preload common bosses for this floor
        get<Array<IsaacResource>>(`/Api/Resources/common-bosses-for-floor/${floorId}`, false, false).then(bossesForThisFloor => {
            if (bossesForThisFloor) {
                this.staticResources.set(StaticResourcesForMenu.CommonBosses, bossesForThisFloor.filter(boss => boss.tags && !boss.tags.some(tag => tag === Tag.DoubleTroubleBossfight)));
            } else {
                this.staticResources.set(StaticResourcesForMenu.CommonBosses, []);
            }
        });

        // ...and the next floorset
        get<Array<IsaacResource>>(`/Api/Resources/next-floorset/${floorId}`, false, false).then(floors => {
            if (floors) {
                this.staticResources.set(StaticResourcesForMenu.NextFloorset, floors);
            } else {
                this.staticResources.set(StaticResourcesForMenu.NextFloorset, []);
            }
        });
    }

    private ShowWasTheFloorCursed() {
        const noCurse = this.GetStaticResource(StaticResourcesForMenu.NoCurse);
        const allCurses = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Curse}`);
        this.Display(new WasTheFloorCursed<SubmitVideo>(this, noCurse, allCurses, this.CurseWasSelected));
    }


    private CurseWasSelected(id: string) {
        if (id !== 'NoCurse') {
            this.history.AddCurse({
                EventType: GameplayEventType.Curse,
                Player: this.currentPlayer,
                RelatedResource1: id
            });
        }

        if (this.history.WeAreOnFirstFloor() && !this.history.CurrentCharacterHasSeed()) {
            this.ShowSelectSeed();
        } else {
            this.ShowMainSelectScreen();
        }
    }

    private ShowSelectSeed() {
        this.Display(new DidNlShowTheSeed<SubmitVideo>(this, this.SeedWasSelected))
    }

    private SeedWasSelected(seed: string) {
        // skipped seed will be empty string
        this.history.AddSeed(seed ? seed : null);
        this.ShowMainSelectScreen();
    }

    private ShowMainSelectScreen() {
        this.Cleanup();
        const events = this.GetStaticResource(StaticResourcesForMenu.MajorGameplayEvents);
        const consumableEvents = this.GetStaticResource(StaticResourcesForMenu.UsedConsumables);
        this.Display(new MainSelectScreen<SubmitVideo>(this, events, consumableEvents, this.ProcessMainSelectScreenSelection))
    }

    

    private ShowWhereDidTheTouchedItemComeFrom() {
        const itemSources = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.ItemSource}`);
        this.Display(new WhereDidTheItemComeFrom<SubmitVideo>(this, itemSources, this.ShowWhatItemWasTouched, this.youtubePlayer, true));
    }

    private ShowWhatItemWasTouched(itemsourceId: string) {
        if (!itemsourceId) {
            this.ShowMainSelectScreen();
            return;
        }
        this.tempChosenItemSource = itemsourceId;

        const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item}&RequiredTags=${Tag.IsSpacebarItem}`);
        this.Display(new WhatItemWasCollected<SubmitVideo>(this, items, this.TouchedItemAndSourceWereSelected, this.ItemWasRerolled, this.youtubePlayer, true, false));
    }

    private TouchedItemAndSourceWereSelected(itemId: string) {
        if (itemId && this.tempChosenItemSource) {
            this.history.AddEvent({
                EventType: GameplayEventType.ItemTouched,
                Player: this.currentPlayer,
                RelatedResource1: itemId,
                RelatedResource2: this.tempChosenItemSource,
                Rerolled: this.wasRerolled
            });
        }
        
        this.ShowMainSelectScreen();
    }

    private ShowWhereDidTheItemComeFrom() {
        const itemSources = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.ItemSource}`);
        this.Display(new WhereDidTheItemComeFrom<SubmitVideo>(this, itemSources, this.ShowWhatItemWasCollected, this.youtubePlayer, false));
    }

    private ShowWhatItemWasCollected(itemsourceId: string) {
        // itemsourceId = empty string if user clicked back button
        if (!itemsourceId) {
            this.ShowMainSelectScreen();
            return;
        }
        this.tempChosenItemSource = itemsourceId;

        const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item}`);
        this.Display(new WhatItemWasCollected<SubmitVideo>(this, items, this.ItemAndSourceWereSelected, this.ItemWasRerolled, this.youtubePlayer, false, false))
    }

    private ItemWasRerolled(wasRerolled: boolean) {
        this.wasRerolled = wasRerolled;
    }

    private Cleanup() {
        this.tempChosenCharacterId = undefined;
        this.tempChosenItemSource = undefined;
        this.wasRerolled = false;
    }

    private ItemAndSourceWereSelected(itemId: string) {
        if (itemId && this.tempChosenItemSource) {
            const event: SubmittedGameplayEvent = {
                EventType: GameplayEventType.ItemCollected,
                Player: this.currentPlayer,
                RelatedResource1: itemId,
                RelatedResource2: this.tempChosenItemSource,
                Rerolled: this.wasRerolled
            };
            this.history.AddEvent(event);
        }

        this.ShowMainSelectScreen();
    }



    static RegisterPage() {
        const page: PageData = {
            Component: SubmitVideo,
            Title: 'loading video...',
            Url: ['SubmitVideo', '{id}'],
            afterRender: () => {
                // make nav bar invisible
                const nav = document.getElementById('nav');
                if (nav) {
                    removeClassIfExists(nav, 'w20');
                    addClassIfNotExists(nav, 'display-none');
                }

                const main = document.getElementById('main-container');
                if (main) {
                    removeClassIfExists(main, 'w80');
                    addClassIfNotExists(main, 'w100');
                }
            },
            beforeLeaving: () => {
                // show nav bar again
                const nav = document.getElementById('nav');
                if (nav) {
                    addClassIfNotExists(nav, 'w20');
                    removeClassIfExists(nav, 'display-none');
                }

                const main = document.getElementById('main-container');
                if (main) {
                    removeClassIfExists(main, 'w100');
                    addClassIfNotExists(main, 'w80');
                }
            },
            canLeave: () => confirm('warning! your progress will not be saved!')
        };
        registerPage(page);
    }
}

