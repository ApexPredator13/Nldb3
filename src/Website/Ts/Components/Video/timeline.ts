import { FrameworkElement, AsyncComponentPart, A, ComponentWithPopup, Component, EventType } from "../../Framework/renderer";
import { Video } from "../../Models/video";
import { TimelinePopup } from "./timeline-popup";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { IsaacImage } from "../General/isaac-image";

export class Timeline extends ComponentWithPopup implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    constructor(video: Promise<Video>, submissionIndex: number) {
        super();

        const element: FrameworkElement = {
            e: ['div'],
            a: [[A.Id, 'timeline-container']]
        };

        this.E = element;
        this.A = this.CreateTimeline(video, submissionIndex);
    }

    CreateTimeline(video: Promise<Video>, submissionIndex: number): Array<AsyncComponentPart> {
        const part: AsyncComponentPart = {
            I: 'timeline-container',
            P: video.then(video => {
                const submission = video.submissions[submissionIndex];
                const floors = submission.played_characters.flatMap(x => x.played_floors);

                const floorUpperElements = new Array<FrameworkElement>();
                const floorElements = new Array<FrameworkElement>();
                const floorLowerElements = new Array<FrameworkElement>();

                for (let i = 0; i < floors.length; ++i) {
                    const floor = floors[i];

                    if (floor.floor.name.toLowerCase().indexOf('chest') !== -1) {
                        console.log(floor);
                    }

                    const durationSplit = video.duration.split(':');
                    const hours = Number(durationSplit[0]);
                    const minutes = Number(durationSplit[1]);
                    const seconds = Number(durationSplit[2]);

                    const videoLength = hours * 3600 + minutes * 60 + seconds;
                    const floorLength = floor.duration - 0.01;
                    const percentage = (100 * floorLength) / videoLength;

                    floorUpperElements.push({
                        e: ['div', i % 2 === 0 ? `↦${floor.floor.name}` : ''],
                        a: [[A.Style, `width: ${percentage}%`], [A.Class, 'timeline-floorname l']]
                    });
                    
                    let floorStartsAt = 0;
                    for (let x = 0; x < i; ++x) {
                        floorStartsAt += floors[x].duration;
                    }

                    const floorElement: FrameworkElement = {
                        e: ['div'],
                        a: [[A.Style, `background-color: ${floor.floor.color}; width: ${percentage}%`], [A.Class, 'r timeline-floor']],
                        c: floor.events.filter(event => event.event_type === GameplayEventType.Bossfight).map(event => new IsaacImage(event, 1, undefined, false)),
                        v: [[EventType.Click, () => window.open(`https://youtu.be/${video.id}?t=${floorStartsAt}`, '_blank')]]
                    }
                    super.CreatePopupForElement(floorElement, new TimelinePopup(floor, submission.played_characters[floor.run_number - 1]));
                    floorElements.push(floorElement);

                    floorLowerElements.push({
                        e: ['div', i % 2 !== 0 ? `↦${floor.floor.name}` : ''],
                        a: [[A.Style, `width: ${percentage}%`], [A.Class, 'timeline-floorname l']]
                    });
                }

                const element: FrameworkElement = {
                    e: ['div'],
                    c: [
                        {
                            e: ['div'],
                            a: [[A.Class, 'timeline-flex']],
                            c: floorUpperElements
                        },
                        {
                            e: ['div'],
                            a: [[A.Class, 'timeline-flex']],
                            c: floorElements
                        },
                        {
                            e: ['div'],
                            a: [[A.Class, 'timeline-flex']],
                            c: floorLowerElements
                        }   
                    ]
                };

                return element;
            })
        };

        return [part];
    }
}


