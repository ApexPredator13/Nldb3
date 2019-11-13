import { FrameworkElement, AsyncComponentPart, A, ComponentWithPopup, Component } from "../../Framework/renderer";
import { Video } from "../../Models/video";
import { TimelinePopup } from "./timeline-popup";

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
                const floorElements = new Array<FrameworkElement>();

                for (const floor of floors) {
                    const durationSplit = video.duration.split(':');
                    const hours = Number(durationSplit[0]);
                    const minutes = Number(durationSplit[1]);
                    const seconds = Number(durationSplit[2]);

                    const videoLength = hours * 3600 + minutes * 60 + seconds;
                    const floorLength = floor.duration - 0.01;
                    const percentage = (100 * floorLength) / videoLength;

                    const floorElement: FrameworkElement = {
                        e: ['div'],
                        a: [[A.Style, `background-color: ${floor.floor.color}; width: ${percentage}%`], [A.Class, 'floor-progress r']]
                    }

                    super.CreatePopupForElement(floorElement, new TimelinePopup(floor, submission.played_characters[floor.run_number - 1]))

                    floorElements.push(floorElement);
                }

                const element: FrameworkElement = {
                    e: ['div'],
                    a: [[A.Style, 'width: 100%;']],
                    c: floorElements
                };

                return element;
            })
        };

        return [part];
    }
}


