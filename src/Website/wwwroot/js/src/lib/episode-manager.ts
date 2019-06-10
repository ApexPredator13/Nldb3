import { SubmittedCompleteEpisode } from '../interfaces/submitted-complete-episode';
import { SubmittedPlayedCharacter } from '../interfaces/submitted-played-character';
import { SubmittedPlayedFloor } from '../interfaces/submitted-played-floor';
import { SubmittedGameplayEvent } from '../interfaces/submitted-gameplay-event';
import { GameplayEventType } from '../enums/gameplay-event-type';
import { GetResourceRequest } from '../interfaces/get-resource-request';
import { getEffectNumber } from '../lib/api-calls';
import { Boxes } from '../components/boxes';
import { History } from '../components/history';
import { IsaacResource } from '../interfaces/isaac-resource';

export class EpisodeManager {

    private currentCharacter = 0;
    private currentFloor = 0;
    private currentGameplayEvent: SubmittedGameplayEvent;
    private currentPlayer = 1;
    private episode: SubmittedCompleteEpisode;
    private history = new History();

    constructor() {
        this.currentGameplayEvent = {
            EventType: GameplayEventType.Unspecified,
            Player: null,
            RelatedResource1: '',
            RelatedResource2: null,
            RelatedResource3: null
        };
        this.episode = {
            VideoId: window.location.href.substr(window.location.href.length - 11, 11),
            PlayedCharacters: new Array<SubmittedPlayedCharacter>()
        };

        this.ResetCurrentEventToDefault();

        this.history.itemWasRemoved.subscribe(data => {
            const e = data.EventIndex;
            const f = data.FloorIndex;
            const c = data.CharacterIndex;

            if (e !== undefined && f !== undefined && c >= 0) {
                this.episode.PlayedCharacters[c].PlayedFloors[f].GameplayEvents.splice(e, 1);
            } else if (f !== undefined && c >= 0) {
                this.episode.PlayedCharacters[c].PlayedFloors.splice(f, 1);
            } else if (c >= 0) {
                this.episode.PlayedCharacters.splice(c, 1);
            }

            this.history.ReloadHistory(this.episode);
        });
    }

    AddCharacter(id: string) {
        this.episode.PlayedCharacters.push({
            CharacterId: id,
            GameMode: 7,
            PlayedFloors: new Array<SubmittedPlayedFloor>()
        });
        this.currentCharacter = this.episode.PlayedCharacters.length - 1;
        this.history.ReloadHistory(this.episode);
    }

    AddGameModeToCharacter(id: string) {
        this.episode.PlayedCharacters[this.currentCharacter].GameMode = parseInt(id, 10);
    }

    AddFloorToCharacter(id: string, bossBoxesContainer: Boxes) {
        const cc = this.episode.PlayedCharacters[this.currentCharacter];
        if (!cc.PlayedFloors) {
            cc.PlayedFloors = new Array<SubmittedPlayedFloor>();
        }

        cc.PlayedFloors.push({
            Duration: null,
            FloorId: id,
            GameplayEvents: new Array<SubmittedGameplayEvent>()
        });

        this.currentFloor = cc.PlayedFloors.length - 1;
        this.history.ReloadHistory(this.episode);
        this.LoadBossesForFloor(bossBoxesContainer, id);
    }

    LoadNextFloorset(currentFloorId: string, floorBoxes: Boxes): void {
        fetch(`/api/resources/next-floorset/${currentFloorId}`).then(x => x.json()).then((nextFloorset: Array<IsaacResource>) => {
            floorBoxes.ReplaceBoxes(nextFloorset);
        });
    }

    AddGameplayEvent(id: string, gameplayEvent: GameplayEventType, resourceNumber: 1 | 2 | 3) {
        if (this.currentGameplayEvent.EventType !== gameplayEvent) {
            this.ResetCurrentEventToDefault();
            this.currentGameplayEvent.EventType = gameplayEvent;
        }

        if (resourceNumber === 1) {
            this.currentGameplayEvent.RelatedResource1 = id;
        } else if (resourceNumber === 2) {
            this.currentGameplayEvent.RelatedResource2 = id;
        }

        // add gameplay event to the floor, depending on what event it was
        switch (gameplayEvent) {

            // needs resource 1, resource 2 and player
            case GameplayEventType.ItemCollected:
            case GameplayEventType.AbsorbedItem:
            case GameplayEventType.ItemTouched:
                this.currentGameplayEvent.Player = this.currentPlayer;
                if (this.currentGameplayEvent.RelatedResource1 && this.currentGameplayEvent.RelatedResource2 && this.currentGameplayEvent.Player) {
                    this.episode.PlayedCharacters[this.currentCharacter].PlayedFloors[this.currentFloor].GameplayEvents.push(Object.assign({}, this.currentGameplayEvent));
                    this.ResetCurrentEventToDefault();
                    this.history.ReloadHistory(this.episode);
                }
                break;

            // needs only resources 1 and player
            case GameplayEventType.OtherConsumable:
            case GameplayEventType.Pill:
            case GameplayEventType.Rune:
            case GameplayEventType.TarotCard:
            case GameplayEventType.Trinket:
            case GameplayEventType.CharacterReroll:
                this.currentGameplayEvent.Player = this.currentPlayer;
                if (this.currentGameplayEvent.RelatedResource1 && this.currentGameplayEvent.Player) {
                    this.episode.PlayedCharacters[this.currentCharacter].PlayedFloors[this.currentFloor].GameplayEvents.push(Object.assign({}, this.currentGameplayEvent));
                    this.ResetCurrentEventToDefault();
                    this.history.ReloadHistory(this.episode);
                }
                break;

            // needs only resource 1
            case GameplayEventType.Bossfight:
            case GameplayEventType.CharacterDied:
                if (this.currentGameplayEvent.RelatedResource1) {
                    this.episode.PlayedCharacters[this.currentCharacter].PlayedFloors[this.currentFloor].GameplayEvents.push(Object.assign({}, this.currentGameplayEvent));
                    this.ResetCurrentEventToDefault();
                    this.history.ReloadHistory(this.episode);
                }
                break;

            // curse needs special treatment, it's the first gameplay event
            case GameplayEventType.Curse:
                if (this.currentGameplayEvent.RelatedResource1) {
                    this.episode.PlayedCharacters[this.currentCharacter].PlayedFloors[this.currentFloor].GameplayEvents.unshift(Object.assign({}, this.currentGameplayEvent));
                    this.ResetCurrentEventToDefault();
                    this.history.ReloadHistory(this.episode);
                }
                break;
            default:
                break;
        }

        console.log(this.episode);
    }

    private LoadBossesForFloor(bossBoxContainer: Boxes, floorId: string): void {
        getEffectNumber(floorId).then(effectNumber => {
            if (effectNumber.length > 0) {
                const loadFloorBosses: GetResourceRequest = {
                    ResourceType: 1,
                    Asc: true,
                    IncludeMod: false,
                    OrderBy1: undefined,
                    OrderBy2: undefined,
                    RequiredTags: effectNumber
                };
                bossBoxContainer.RequestAndReplaceBoxes(loadFloorBosses);
            }
        });
    }

    private ResetCurrentEventToDefault() {
        this.currentGameplayEvent = {
            EventType: GameplayEventType.Unspecified,
            Player: null,
            RelatedResource1: '',
            RelatedResource2: null,
            RelatedResource3: null
        }
    }
}