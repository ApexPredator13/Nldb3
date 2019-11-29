import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { ComponentWithSubscribers } from "../../Framework/ComponentBaseClasses/component-with-subscribers";
import { postResponse } from "../../Framework/http";
import { HistoryTable } from "./history-table";
import { getUser } from "../../Framework/Customizable/authentication";

export class ConfirmSubmitEpisode<TSubscriber> extends ComponentWithSubscribers<TSubscriber, boolean> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        submissionResultProcessor: (result: boolean) => any,
        private history: HistoryTable<TSubscriber>,
        showSubmissionFailed: boolean
    ) {
        super(subscriber, submissionResultProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', showSubmissionFailed ? 'Error! The run was not submitted successfully. Click here to try again:' : 'The episode is complete! Click here to submit the episode:'],
                    a: [showSubmissionFailed ? [A.Style, 'color: orange'] : null]
                },
                {
                    e: ['button', showSubmissionFailed ? 'Submit Again!' : 'Submit Episode'],
                    a: [[A.Id, 'submit-episode-button']],
                    v: [[EventType.Click, e => this.SubmitEpisode(e)]]
                }
            ]
        };
    }

    private SubmitEpisode(e: Event) {
        e.preventDefault();
        const target = e.target;
        if (target && target instanceof HTMLButtonElement) {
            target.disabled = true;

            const user = getUser();

            if (user) {
                const completeEpisode = this.history.GetCollectedEpisodeData();
                const completeEpisodeAsBody = JSON.stringify(completeEpisode);

                postResponse('/SubmitEpisode', completeEpisodeAsBody, true).then(response => {
                    super.Emit(response.ok);
                }).catch(() => {
                    super.Emit(false);
                });
            } else {
                super.Emit(false);
            }
        } else {
            super.Emit(false);
        }
    }
}