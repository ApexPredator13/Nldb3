import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { navigate } from "../../Framework/router";

export class SubmissionSucceeded implements Component {
    E: FrameworkElement;

    constructor(videoId: string) {
        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'Video submitted successfully! Click here to see the results:']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Results'],
                            a: [[A.Class, 'u hand']],
                            v: [[EventType.Click, e => navigate(`/${videoId}`, e)]]
                        }
                    ]
                }
            ]
        };
    }
}


