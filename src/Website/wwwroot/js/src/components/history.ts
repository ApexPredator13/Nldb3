import { SubmittedCompleteEpisode } from "../interfaces/submitted-complete-episode";
import { History as HistoryInterface, HistoryImage } from '../interfaces/History';
import { Subject } from "rxjs";

export class History {

    public itemWasRemoved = new Subject<{characterIndex: number, floorIndex: number | undefined, eventIndex: number | undefined}>();

    private historyContainer: HTMLTableElement;

    constructor() {
        this.historyContainer = document.getElementById("history") as HTMLTableElement;
    }

    ReloadHistory(episode: SubmittedCompleteEpisode): void {
        const requestData: RequestInit = {
            method: 'POST',
            body: JSON.stringify(episode),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        fetch(`/api/resources/history`, requestData).then(response => response.json()).then((history: HistoryInterface) => {
            console.log('response: ', history);
            const table = document.createElement('table');
            let currentRow: HTMLTableRowElement | null = null;
            for (let c = 0; c < history.characterHistory.length; c++) {
                const row = document.createElement('tr');
                table.appendChild(row);
                row.appendChild(this.CreateHistoryCell(history.characterHistory[c].characterImage, c));

                for (let f = 0; f < history.characterHistory[c].floors.length; f++) {
                    if (f === 0) {
                        currentRow = row;
                        row.appendChild(this.CreateHistoryCell(history.characterHistory[c].floors[f].floorImage, c, f));
                        row.appendChild(document.createElement('td'));
                    } else {
                        const newFloorRow = document.createElement('tr');
                        currentRow = newFloorRow;

                        newFloorRow.appendChild(document.createElement('td'));
                        newFloorRow.appendChild(this.CreateHistoryCell(history.characterHistory[c].floors[f].floorImage, c, f));
                        newFloorRow.appendChild(document.createElement('td'));

                        table.appendChild(newFloorRow);
                    }

                    for (let e = 0; e < history.characterHistory[c].floors[f].events.length; e++) {
                        if (!currentRow) {
                            continue;
                        }
                        currentRow.children[2].appendChild(this.CreateHistoryImage(history.characterHistory[c].floors[f].events[e].image, c, f, e));
                    }
                }
            }
            this.historyContainer.innerHTML = '';
            this.historyContainer.appendChild(table);
        });
    }

    private CreateHistoryCell(i: HistoryImage, characterId: number, floorId?: number | undefined, eventId?: number | undefined) {
        const cell = document.createElement('td');
        cell.appendChild(this.CreateHistoryImage(i, characterId, floorId, eventId));
        return cell;
    }

    private CreateHistoryImage(i: HistoryImage, characterId: number, floorId?: number | undefined, eventId?: number | undefined) {
        const element = document.createElement('div');
        element.style.background = `url('/img/isaac.png') -${i.x <= 0 ? 0 : i.x}px -${i.y <= 0 ? 0 : i.y}px transparent`;
        element.style.width = `${i.w <= 5 ? 31 : i.w}px`;
        element.style.height = `${i.h <= 5 ? 31 : i.h}px`;
        element.style.display = 'inline-block';
        element.style.cursor = 'pointer';
        element.title = 'click to delete';

        if (characterId !== undefined) {
            element.setAttribute('c', characterId.toString(10));
        }
        if (floorId !== undefined) {
            element.setAttribute('f', floorId.toString(10));
        }
        if (eventId !== undefined) {
            element.setAttribute('e', eventId.toString(10));
        }
        element.addEventListener('click', () => this.itemWasRemoved.next({ characterIndex: characterId, floorIndex: floorId, eventIndex: eventId }));
        return element;
    }
}

