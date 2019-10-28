import { SubmittedCompleteEpisode } from '../interfaces/submitted-complete-episode';
import { SubmittedPlayedCharacter } from '../interfaces/submitted-played-character';
import { SubmittedPlayedFloor } from '../interfaces/submitted-played-floor';
import { SubmittedGameplayEvent } from '../interfaces/submitted-gameplay-event';
import { GameplayEventType } from '../enums/gameplay-event-type';
import { History } from '../components/history';

export class EpisodeHistoryManager {

    private currentCharacter = 0;
    private currentFloor = 0;
    private currentGameplayEvent: SubmittedGameplayEvent;
    private currentPlayer: 1 | 2 = 1;
    private episode: SubmittedCompleteEpisode;

    public history = new History();

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
        console.log('initial video object: ', this.episode);

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

    IsLastFloor(index: number | undefined): boolean {
        if (index === undefined) {
            return false;
        }
        const lastCharacter = this.episode.PlayedCharacters[this.episode.PlayedCharacters.length - 1];
        const numberOfFloors = lastCharacter.PlayedFloors.length;
        if (index === numberOfFloors) {
            return true;
        } else {
            return false;
        }
    }

    IsLastCharacter(index: number | undefined): boolean {
        if (index === undefined) {
            return false;
        }
        const lastCharacter = this.episode.PlayedCharacters.length;
        if (index === lastCharacter) {
            return true;
        } else {
            return false;
        }
    }

    CharacterIsOnFirstFloor(): boolean {
        if (!this.episode.PlayedCharacters || this.episode.PlayedCharacters.length === 0) {
            return false;
        }
        if (this.episode.PlayedCharacters[this.currentCharacter].PlayedFloors && this.episode.PlayedCharacters[this.currentCharacter].PlayedFloors.length === 1) {
            return true;
        }
        return false;
    }

    CharacterHasSeed(): boolean {
        if (!this.episode.PlayedCharacters || this.episode.PlayedCharacters.length === 0) {
            return false;
        }

        const character = this.episode.PlayedCharacters[this.episode.PlayedCharacters.length - 1];

        if (character.Seed || character.Seed === null) {
            return true;
        }

        return false;
    }

    AddSeedToCharacter(seed: string | null) {
        if (seed === null) {
            this.episode.PlayedCharacters[this.episode.PlayedCharacters.length - 1].Seed = seed;
        } else if (seed.length === 8 && this.episode.PlayedCharacters.length >= 1) {
            this.episode.PlayedCharacters[this.episode.PlayedCharacters.length - 1].Seed = seed;
        }
    }

    AddCharacter(id: string) {
        this.episode.PlayedCharacters.push({
            CharacterId: id,
            GameMode: 7,
            PlayedFloors: new Array<SubmittedPlayedFloor>(),
            Seed: undefined
        });
        this.currentCharacter = this.episode.PlayedCharacters.length - 1;
        this.history.ReloadHistory(this.episode);
    }

    AddGameModeToCharacter(id: string) {
        this.episode.PlayedCharacters[this.currentCharacter].GameMode = parseInt(id, 10);
    }

    AddFloorToCharacter(id: string) {
        const cc = this.episode.PlayedCharacters[this.currentCharacter];
        if (!cc.PlayedFloors) {
            cc.PlayedFloors = new Array<SubmittedPlayedFloor>();
        }

        cc.PlayedFloors.push({
            Duration: null,
            FloorId: id,
            GameplayEvents: new Array<SubmittedGameplayEvent>()
        });

        if (cc.PlayedFloors.length > 1) {
            let totalSoFar = 0;
            cc.PlayedFloors.map(f => {
                if (f.Duration !== null) {
                    totalSoFar += f.Duration;
                }
            });

            const exipredSoFar = Math.floor(this.GetVideoTime());
            const lastFloorDuration = exipredSoFar - totalSoFar;

            cc.PlayedFloors[cc.PlayedFloors.length - 2].Duration = lastFloorDuration;
        }

        this.currentFloor = cc.PlayedFloors.length - 1;
        this.history.ReloadHistory(this.episode);
    }

    ChangeCurrentPlayer(currentPlayer: 1 | 2) {
        this.currentPlayer = currentPlayer;
    }

    RefreshCurrentValues(): void {
        console.log('previous character', this.currentCharacter);
        console.log('previous floor', this.currentFloor);
        this.currentCharacter = this.episode.PlayedCharacters.length - 1;
        this.currentFloor = this.episode.PlayedCharacters[this.currentCharacter].PlayedFloors.length - 1;
        console.log('current character', this.currentCharacter);
        console.log('current floor', this.currentFloor);
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
            case GameplayEventType.StartingTrinket:
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

    Submit(): Promise<Response> {
        const headers: Headers = new Headers();
        headers.append('content-type', 'application/json');
        const request: RequestInit = {
            method: 'POST',
            body: JSON.stringify(this.episode),
            headers: headers
        };
        return fetch(`/SubmitEpisode`, request);
    }

    private GetVideoTime(): number {
        console.log((window as any).youtubePlayer);
        const time = (window as any).youtubePlayer.getCurrentTime();
        console.log('seconds elapsed: ', time);
        return time as number;
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