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
import { PageData, registerPage, setTitle } from "../Framework/router";
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
import { WasThereAStartingItem } from "../Components/SubmitVideo/m-was-there-a-starting-item";
import { WasThereAnotherStartingItem } from "../Components/SubmitVideo/m-was-there-another-starting-item";
import { WasThereAStartingTrinket } from "../Components/SubmitVideo/m-was-there-a-starting-trinket";
import { WasThereAnotherStartingTrinket } from "../Components/SubmitVideo/m-was-there-another-starting-trinket";
import { WhatPillWasTaken } from "../Components/SubmitVideo/m-what-pill-was-taken";
import { WhatTarotCardWasUsed } from "../Components/SubmitVideo/m-what-tarot-card-was-used";
import { WhatRuneWasUsed } from "../Components/SubmitVideo/m-what-rune-was-used";
import { DidBlackRuneAbsorbAnItem } from "../Components/SubmitVideo/m-did-black-rune-absorb-an-item";
import { WhatOtherConsumableWasUsed } from "../Components/SubmitVideo/m-what-other-consumable-was-used";
import * as Driver from 'driver.js';
import { WhatOtherEventHappened } from "../Components/SubmitVideo/m-what-other-event-happened";
import { HowDidNlRerollHisCharacter } from "../Components/SubmitVideo/m-how-did-nl-reroll-his-character";
import { WhatTransformationDidNlRerollInto } from "../Components/SubmitVideo/m-what-transformation-did-nl-reroll-into";
import { WhatCharacterDidNlChangeInto } from "../Components/SubmitVideo/m-what-character-did-nl-change-into";

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

const beforeUnloadEvent = (e: Event) => {
    e.preventDefault();
    (e.returnValue as any) = '';
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
    private playPauseSpan: HTMLSpanElement | undefined;

    private tempChosenCharacterId: string | undefined;
    private tempChosenItemSource: string | undefined;
    private wasRerolled = false;

    playPauseInterval: number | undefined;

    private initialMenu: WhatCharacterWasChosen<SubmitVideo>;

    constructor(parameters: Array<string>) {
        this.videoId = parameters[0];
        const origin = getConfig().baseUrlWithoutTrailingSlash;
        this.youtubePlayer = new YoutubePlayer(this.videoId);
        this.history = new HistoryTable<SubmitVideo>(this, this.videoId, this.ItemWasRemovedFromHistory, this.youtubePlayer);
        this.currentPlayer = 1;
        this.storedServerResources = new Map<string, Array<IsaacResource>>();
        this.staticResources = new Map<StaticResourcesForMenu, Array<IsaacResource>>();
        this.CreateInitialStaticResources();
        this.initialMenu = new WhatCharacterWasChosen(this, this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Character.toString(10)}`), this.CharacterWasChosen);

        // make sure play/pause icon is accurate at the beginning and throughout the session
        this.playPauseInterval = setInterval(() => this.SetPlayPauseIcon(), 2000);

        // change title
        get<string>(`/Api/Videos/Title/${this.videoId}`).then(title => {
            if (title) {
                setTitle(`Submitting: ${title}`);
            }
        });

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
                                        [A.Src, `https://www.youtube.com/embed/${this.videoId}?enablejsapi=1&origin=${origin}&rel=0&autoplay=0`],
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
                        {
                            e: ['div'],
                            a: [[A.Id, 'player-and-seed-container']],
                            c: [
                                {
                                    e: ['div'],
                                    a: [[A.Id, 'player-controls']],
                                    c: [
                                        {
                                            e: ['span', '⏪'],
                                            a: [[A.Id, 'rewind'], [A.Class, 'hand'], [A.Title, 'Go back 5 seconds']],
                                            v: [[EventType.Click, () => this.RewindClicked()]]
                                        },
                                        {
                                            e: ['span', '▶️'],
                                            a: [[A.Id, 'play-pause'], [A.Class, 'hand'], [A.Title, 'Play / Pause']],
                                            v: [[EventType.Click, () => this.PlayPauseClicked()]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div', 'Player: 1'],
                                    a: [[A.Id, 'current-player-container'], [A.Class, 'hand display-none']],
                                    v: [[EventType.Click, e => this.ChangePlayer(e)]]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Id, 'seed-container'], [A.Class, 'hand display-none']],
                                    v: [[EventType.Click, () => this.ShowSelectSeed()]]
                                }
                            ]
                        },
                        {
                            e: ['div'],
                            a: [[A.Id, 'menu-container']],
                            c: [
                                this.initialMenu
                            ]
                        }
                    ]
                }
            ]
        }
    }

    private RewindClicked() {
        this.youtubePlayer.Seek(-5);
    }

    private PlayPauseClicked() {
        const currentState = this.youtubePlayer.GetPlayerState();
        if (currentState === YT.PlayerState.PLAYING) {
            this.youtubePlayer.PauseVideo();
        } else {
            this.youtubePlayer.PlayVideo();
        }

        setTimeout(() => this.SetPlayPauseIcon(), 100);
    }

    private SetPlayPauseIcon() {
        const currentState = this.youtubePlayer.GetPlayerState();
        let playPause: HTMLSpanElement | undefined;

        if (this.playPauseSpan) {
            playPause = this.playPauseSpan;
        } else {
            const findPlayPauseResult = document.getElementById('play-pause');
            if (findPlayPauseResult && findPlayPauseResult instanceof HTMLSpanElement) {
                this.playPauseSpan = findPlayPauseResult;
                playPause = findPlayPauseResult;
            }
        }

        if (playPause) {
            if (currentState === YT.PlayerState.PLAYING) {
                playPause.innerText = '⏸️';
            } else {
                playPause.innerText = '▶️';
            }
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
        // ask the user to select a floor again if the first floor must be re-selected, or show the main menu if another floor exists already.
        if (removedElement.characterIndex !== null && removedElement.floorIndex !== null && removedElement.eventIndex === null) {
            if (this.history.CharacterHasNoFloorsSelected()) {
                this.ShowChooseFloor();
            } else {
                this.ShowMainSelectScreen();
            }
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
            if (target.innerText === 'Player: 1') {
                addClassIfNotExists(target, 'change-player-container-modifier');
                this.currentPlayer = 2;
                target.innerText = 'Player: 2'
            } else {
                removeClassIfExists(target, 'change-player-container-modifier');
                this.currentPlayer = 1;
                target.innerText = 'Player: 1';
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

        const rightColumn = document.getElementById('menu-container');
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
            { id: GameplayEventType.DownToTheNextFloor.toString(10), name: 'Down to the next floor!', x: 105, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: GameplayEventType.Clicker.toString(10), name: 'Other Events', x: 1190, y: 0, w: 35, h: 35 } as IsaacResource
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
            { id: 'no', name: 'No, move on!', x: 665, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
        this.staticResources.set(StaticResourcesForMenu.DidBlackRuneAbsorbAnotherItem, [
            { id: 'no', name: 'No, that was it!', x: 700, y: 0, w: 35, h: 35 } as IsaacResource
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
        this.HideSeedInputElement();

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
            case GameplayEventType.Pill: this.ShowChoosePill(); break;
            case GameplayEventType.TarotCard: this.ShowChooseTarotCard(); break;
            case GameplayEventType.Rune: this.ShowChooseRune(); break;
            case GameplayEventType.OtherConsumable: this.ShowChooseOtherConsumable(); break;
            case GameplayEventType.Clicker: this.ShowWhatOtherEventHappened(); break;
            case GameplayEventType.RerollTransform: this.ShowWhatOtherEventHappened(); break;
            default: this.ShowMainSelectScreen(); break;
        }
    }

    private ShowWhatOtherEventHappened() {
        const menu = new WhatOtherEventHappened(this, this.OtherEventTypeSelected);
        this.Display(menu);
    }

    private OtherEventTypeSelected(eventType: string) {
        if (!eventType) {
            this.ShowMainSelectScreen();
            return;
        }

        if (eventType === 'reroll-transform') {
            this.ShowHowDidNlRerollHisCharacter();
        } else if (eventType === 'clicker') {
            this.ShowWhatCharacterDidNlChangeInto();
        }
    }

    private ShowWhatCharacterDidNlChangeInto() {
        const characters = get<Array<IsaacResource>>(`/Api/Resources/?ResourceType=${ResourceType.Character.toString(10)}`);
        const menu = new WhatCharacterDidNlChangeInto(this, this.ClickerCharacterSelected, characters);
        this.Display(menu);
    }

    private ClickerCharacterSelected(characterId: string) {
        if (characterId) {
            this.history.AddEvent({
                EventType: GameplayEventType.Clicker,
                RelatedResource1: 'Clicker',
                RelatedResource2: characterId,
                Player: this.currentPlayer
            });
        }
        this.ShowMainSelectScreen();
    }

    private ShowHowDidNlRerollHisCharacter() {
        const rerolls = get<Array<IsaacResource>>(`/Api/Resources/?ResourceType=${ResourceType.Unspecified.toString(10)}&RequiredTags=${Tag.CanRerollCharacter.toString(10)}`);
        const menu = new HowDidNlRerollHisCharacter(this, this.CharacterRerollBeforeTransformationChosen, rerolls);
        this.Display(menu);
    }

    private CharacterRerollBeforeTransformationChosen(characterRerollId: string) {
        this.tempChosenItemSource = characterRerollId;
        const transformations = get<Array<IsaacResource>>(`/Api/Resources/?ResourceType=${ResourceType.Transformation}`);
        const menu = new WhatTransformationDidNlRerollInto(this, this.RerolledTransformationSelected, transformations);
        this.Display(menu);
    }

    private RerolledTransformationSelected(transformationId: string) {
        if (transformationId && this.tempChosenItemSource) {
            this.history.AddEvent({
                EventType: GameplayEventType.RerollTransform,
                RelatedResource1: this.copyString(this.tempChosenItemSource),
                RelatedResource2: transformationId,
                Player: this.currentPlayer
            });
        }
        this.ShowMainSelectScreen();
    }

    private copyString(s: string): string {
        return (' ' + s).slice(1);
    }

    private ShowChooseOtherConsumable() {
        const consumables = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.OtherConsumable.toString(10)}`);
        const menu = new WhatOtherConsumableWasUsed(this, this.OtherConsumableChosen, consumables);
        this.Display(menu);
    }

    private OtherConsumableChosen(consumableId: string) {
        if (consumableId) {
            this.history.AddEvent({
                EventType: GameplayEventType.OtherConsumable,
                Player: this.currentPlayer,
                RelatedResource1: consumableId
            });
        }
        this.ShowMainSelectScreen();
    }

    private ShowChooseRune() {
        const runes = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Rune.toString(10)}`);
        const menu = new WhatRuneWasUsed(this, this.RuneChosen, runes);
        this.Display(menu);
    }

    private RuneChosen(runeId: string) {
        if (runeId) {
            this.history.AddEvent({
                EventType: GameplayEventType.Rune,
                Player: this.currentPlayer,
                RelatedResource1: runeId
            });

            if (runeId === 'BlackRune') {
                this.tempChosenItemSource = runeId;
                this.ShowDidBlackRuneAbsorbAnItem();
                return;
            }
        }
        this.ShowMainSelectScreen();
    }

    private ShowDidBlackRuneAbsorbAnItem() {
        const icon = this.GetStaticResource(StaticResourcesForMenu.DidBlackRuneAbsorbAnItem);
        const menu = new DidBlackRuneAbsorbAnItem(this, this.BlackRuneAbsorbedAnItemChoiceMade, icon, true);
        this.Display(menu);
    }

    private BlackRuneAbsorbedAnItemChoiceMade(choice: string) {
        if (choice === 'no') {
            this.history.AddEventIfLastEventWasNotOfType({
                EventType: GameplayEventType.Rune,
                RelatedResource1: 'BlackRune',
                Player: this.currentPlayer
            }, GameplayEventType.AbsorbedItem, 'Black Rune');
            this.ShowMainSelectScreen();
        } else {
            const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item.toString(10)}`);
            const menu = new WhatItemWasCollected(this, items, this.BlackRuneAbsorbedAnItemChosen, this.ItemWasRerolled, this.youtubePlayer, false, true);
            this.Display(menu);
        }
    }

    private BlackRuneAbsorbedAnItemChosen(itemId: string) {
        if (!itemId) {
            this.ShowMainSelectScreen();
        } else {
            this.history.AddEvent({
                EventType: GameplayEventType.AbsorbedItem,
                RelatedResource1: itemId,
                RelatedResource2: 'BlackRune',
                Player: this.currentPlayer,
                Rerolled: this.wasRerolled
            });
            this.ShowDidBlackRuneAbsorbAnotherItem();
        }
    }

    private ShowDidBlackRuneAbsorbAnotherItem() {
        const icon = this.GetStaticResource(StaticResourcesForMenu.DidBlackRuneAbsorbAnotherItem);
        const menu = new DidBlackRuneAbsorbAnItem(this, this.BlackRuneAbsorbedAnItemChoiceMade, icon, false);
        this.Display(menu);
    }

    private ShowChooseTarotCard() {
        const tarotCards = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.TarotCard.toString(10)}`);
        const menu = new WhatTarotCardWasUsed(this, this.TarotCardChosen, tarotCards);
        this.Display(menu);
    }

    private TarotCardChosen(tarotCardId: string) {
        if (tarotCardId) {
            this.history.AddEvent({
                EventType: GameplayEventType.TarotCard,
                Player: this.currentPlayer,
                RelatedResource1: tarotCardId
            });
        }
        this.ShowMainSelectScreen();
    }

    private ShowChoosePill() {
        const pills = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Pill.toString(10)}`);
        const menu = new WhatPillWasTaken(this, this.PillChosen, pills);
        this.Display(menu);
    }

    private PillChosen(pillId: string) {
        if (pillId) {
            this.history.AddEvent({
                EventType: GameplayEventType.Pill,
                Player: this.currentPlayer,
                RelatedResource1: pillId
            });
        }
        this.ShowMainSelectScreen();
    }

    private ShowWasThereAStartingItem() {
        const icon = this.GetStaticResource(StaticResourcesForMenu.NoStartingItems);
        const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item.toString(10)}`);
        const menu = new WasThereAStartingItem(this, this.StartingItemChosen, icon, items, true);
        this.Display(menu);
    }

    private StartingItemChosen(itemId: string) {
        if (itemId === 'none') {
            this.ShowWasThereAStartingTrinket();
        } else {
            this.history.AddEvent({
                EventType: GameplayEventType.ItemCollected,
                RelatedResource1: itemId,
                RelatedResource2: 'StartingItem',
                Player: this.currentPlayer,
                Rerolled: false
            });
            this.ShowWasThereAnotherStartingItem();
        }
    }

    private ShowWasThereAnotherStartingItem() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.MoreStartingItems);
        const menu = new WasThereAnotherStartingItem(this, this.ShowChooseAnotherStartingItem, icons);
        this.Display(menu);
    }

    private ShowChooseAnotherStartingItem(choice: string) {
        if (choice === 'yes') {
            const icon = this.GetStaticResource(StaticResourcesForMenu.NoStartingItems);
            const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item.toString(10)}`);
            const menu = new WasThereAStartingItem(this, this.StartingItemChosen, icon, items, true);
            this.Display(menu);
        } else {
            this.ShowWasThereAStartingTrinket();
        }
    }

    private ShowWasThereAStartingTrinket() {
        const icon = this.GetStaticResource(StaticResourcesForMenu.NoStartingTrinkets);
        const trinkets = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Trinket.toString(10)}`);
        const menu = new WasThereAStartingTrinket(this, this.StartingTrinketChosen, icon, trinkets, true);
        this.Display(menu);
    }

    private StartingTrinketChosen(trinketId: string) {
        if (trinketId === 'none') {
            this.ShowMainSelectScreen();
        } else {
            this.history.AddEvent({
                EventType: GameplayEventType.StartingTrinket,
                RelatedResource1: trinketId,
                Player: this.currentPlayer
            });
            this.ShowWasThereAnotherStartingTrinket();
        }
    }

    private ShowWasThereAnotherStartingTrinket() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.MoreStartingTrinkets);
        const menu = new WasThereAnotherStartingTrinket(this, this.ShowChooseAnotherStartingTrinket, icons);
        this.Display(menu);
    }

    private ShowChooseAnotherStartingTrinket(choice: string) {
        if (choice === 'yes') {
            const icon = this.GetStaticResource(StaticResourcesForMenu.NoStartingTrinkets);
            const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Trinket.toString(10)}`);
            const menu = new WasThereAStartingTrinket(this, this.StartingTrinketChosen, icon, items, true);
            this.Display(menu);
        } else {
            this.ShowMainSelectScreen();
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

        if (this.tempChosenItemSource === 'BlackRune') {
            this.history.AddEvent({
                RelatedResource1: this.copyString(this.tempChosenItemSource),
                EventType: GameplayEventType.Rune,
                Player: this.currentPlayer
            });
        }

        this.history.AddEvent({
            RelatedResource1: absorbedItemId,
            RelatedResource2: this.copyString(this.tempChosenItemSource),
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

        if (floorId.toLowerCase().endsWith('xl')) {
            this.CurseWasSelected('CurseOfTheLabyrinth');
        } else {
            this.ShowWasTheFloorCursed();
        }

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
        this.Display(new DidNlShowTheSeed<SubmitVideo>(this, this.SeedWasSelected, this.UpdateSeedText))
    }

    private SeedWasSelected(seed: string) {
        // skipped seed will be empty string
        this.history.AddSeed(seed ? seed : null);

        if (this.history.WeAreOnFirstFloor() && !this.history.CharacterHasStartingItems()) {
            this.ShowWasThereAStartingItem();
        } else {
            this.ShowMainSelectScreen();
        }
    }

    private ShowMainSelectScreen() {
        this.Cleanup();
        this.ShowSeedInputElement();
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
                RelatedResource2: this.copyString(this.tempChosenItemSource),
                Rerolled: this.wasRerolled
            });
        }
        
        this.ShowMainSelectScreen();
    }

    private ShowWhereDidTheItemComeFrom() {
        const itemSources = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.ItemSource}`);
        this.Display(new WhereDidTheItemComeFrom<SubmitVideo>(this, itemSources, this.ShowWhatItemWasCollected, this.youtubePlayer, false));
    }

    private UpdateSeedText(seed: string) {
        const seedDiv = document.getElementById('seed-container');
        if (seedDiv && seedDiv instanceof HTMLDivElement) {
            if (seed) {
                seedDiv.innerText = 'Seed: ' + seed;
            } else {
                seedDiv.innerText = 'Enter seed';
            }
        }
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
        const player = document.getElementById('current-player-container');
        if (player && player instanceof HTMLDivElement) {
            removeClassIfExists(player, 'display-none');
        }
    }

    private ItemAndSourceWereSelected(itemId: string) {
        if (itemId && this.tempChosenItemSource) {
            const event: SubmittedGameplayEvent = {
                EventType: GameplayEventType.ItemCollected,
                Player: this.currentPlayer,
                RelatedResource1: itemId,
                RelatedResource2: this.copyString(this.tempChosenItemSource),
                Rerolled: this.wasRerolled
            };
            this.history.AddEvent(event);
        }

        this.ShowMainSelectScreen();
    }

    private HideSeedInputElement = () => {
        const seedContainer = document.getElementById('seed-container');
        if (seedContainer && seedContainer instanceof HTMLDivElement) {
            seedContainer.innerText = '';
            addClassIfNotExists(seedContainer, 'display-none');
        }
    }

    private ShowSeedInputElement = () => {
        const seedContainer = document.getElementById('seed-container');
        if (seedContainer && seedContainer instanceof HTMLDivElement) {
            const seed = this.history.GetSeed();
            seedContainer.innerText = seed ? `Seed: ${seed}` : 'Enter seed';
            removeClassIfExists(seedContainer, 'display-none');
        }
    }

    LaunchMainMenuTutorial() {
        this.youtubePlayer.PauseVideo();

        const driver = new Driver({ allowClose: false });
        driver.defineSteps([
            {
                element: '#b60',
                popover: {
                    title: 'Collected Item',
                    description: 'If NL collects an item, click here!',
                    position: 'left'
                }
            },
            {
                element: '#b61',
                popover: {
                    title: 'Touched Item',
                    description: 'If NL only touches a spacebar item and puts it down again (to get transformation bonuses or to take it out of the item pool), click here!',
                    position: 'left'
                }
            },
            {
                element: '#b62',
                popover: {
                    title: 'Bossfight',
                    description: 'If NL encounters a boss, click here (even if he doesn\'t win or doesn\'t finish the fight!).',
                    position: 'left'
                }
            },
            {
                element: '#b63',
                popover: {
                    title: 'Trinkets',
                    description: 'If NL switches out his trinket, click here! Only trinkets that NL used for a while count!',
                    position: 'left'
                }
            },
            {
                element: '#b64',
                popover: {
                    title: 'Character Reroll',
                    description: 'Did NL use the D4 / D100 / the 6-Room or did "Missing No." trigger at the beginning of the floor? That\'s what this is for!',
                    position: 'left'
                }
            },
            {
                element: '#b65',
                popover: {
                    title: 'Absorbed Items',
                    description: 'This box is for items that got absorbed by Void or Black Rune!',
                    position: 'left'
                }
            },
            {
                element: '#b66',
                popover: {
                    title: 'DIED!',
                    description: 'If NL got killed and the run ended, click this box to choose how he got killed!',
                    position: 'left'
                }
            },
            {
                element: '#b67',
                popover: {
                    title: 'WON!',
                    description: 'Northernlion killed a final boss and won the run? click here!',
                    position: 'left'
                }
            },
            {
                element: '#b68',
                popover: {
                    title: 'Down to the next floor!',
                    description: 'This will take you to the "next floor" select screen. '
                        + 'HINT: Try to choose the next floor when NL really enters the trap door - '
                        + 'the current time of the youtube player will be saved as a timestamp to calculate floor timings! :) '
                        + 'If a floor gets repeated (5-Room or Forget Me Now) also use this.',
                    position: 'left'
                }
            },
            {
                element: '#b69',
                popover: {
                    title: 'Other Events',
                    description: 'Everything that doesn\'t fit anywhere else. Currently used for: Transformations '
                        + 'that happened when rerolling the character (for example becoming \'Lord of the Flies\' after using the D100) and changing the '
                        + 'character with the "Clicker".',
                    position: 'left'
                }
            },
            {
                element: '#box7',
                popover: {
                    description: 'If Northernlion uses a consumable, use one of these buttons.',
                    title: 'Consumables',
                    position: 'left'
                }
            },
            {
                element: '#current-player-container',
                popover: {
                    title: '2-Player Mode',
                    description: 'If Northernlion plays as Jacob & Esau, use this button to switch between the two characters.' 
                        + 'It\'s a little tricky but you can do it! :) Also, Isaac might get a real 2-player mode one day...',
                    position: 'left',
                }
            },
            {
                element: '#seed-container',
                popover: {
                    title: 'Seed',
                    description: 'Did Northernlion show the seed later in the video? click here to add / change the seed at any time.',
                    position: 'left'
                }
            },
            {
                element: '#player-controls',
                popover: {
                    title: 'Player Controls',
                    description: 'Sometimes it\'s convenient to go back a couple seconds or pause the video without messing with the youtube player directly. ⏪ takes you '
                        + 'back 5 seconds, ▶️ and ⏸️ play and pause the video.',
                    position: 'bottom'
                }
            },
            {
                element: '#quotes',
                popover: {
                    title: 'Quotes',
                    description: 'Northernlion is a funny dude. If he says something really funny, type it into the textbox and submit it!',
                    position: 'top'
                }
            },
            {
                element: '#quote-started-at-container',
                popover: {
                    title: 'Quote Video Timestamp',
                    description: 'Select when the quote happened in the video so that people can jump right to the quote on youtube! '
                        + '"Current video time" will save the current time the youtube player is at right now. The second option lets you specify an exact time.',
                    position: 'top'
                }
            },
            {
                element: '#submit-topic-container',
                popover: {
                    title: 'Topics / Tangents',
                    description: 'This is for broad discussion topics and tangents NL went on. Maybe we can search NL videos by "tangents" in the future...?',
                    position: 'top'
                }
            },
            {
                element: '#history-container',
                popover: {
                    title: 'History',
                    description: 'All events you select will appear here in chronological order. If you added anything by accident, you can click individual events to remove them from the log! NOTE: '
                        + 'Removing a floor or a character will also remove all events that happend on that floor, or everything that happened to that character! (a confirmation dialog will appear in those cases.)',
                    position: 'top'
                }
            },
            {
                element: '#launch-tutorial',
                popover: {
                    title: 'Additional Help',
                    description: 'On some pages there is more help available. Watch out for this link -  it might help you out if you get stuck or run into an edge case! And that\'s it! Thanks for taking the time to contribute and good luck!',
                    position: 'left'
                }
            }
        ]);

        setTimeout(() => {
            driver.start();
        }, 100);
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

                // add beforeUnload event
                window.addEventListener('beforeunload', beforeUnloadEvent);
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

                // remove beforeUnload event
                window.removeEventListener('beforeunload', beforeUnloadEvent);

                if (page.Component instanceof SubmitVideo && typeof (page.Component.playPauseInterval)) {
                    // clear interval
                    clearInterval(page.Component.playPauseInterval);
                    console.warn('failed to clear interval');

                    // destroy youtube player
                    page.Component.youtubePlayer.DestroyIframe();
                }
            },
            canLeave: () => confirm('warning! your progress will not be saved!')
        };
        registerPage(page);
    }
}

