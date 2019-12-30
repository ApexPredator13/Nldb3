import { Div, t, Html, h1, hr, h2, p, form, attr, input, select, div, formButton } from "../../Framework/renderer";
import { get } from "../../Framework/http";
import { registerPage } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { gameplayEventTypeToString } from "../../Enums/enum-to-string-converters";
import { gameplayEventTypeOptionList } from "../../Components/Admin/option-lists";
import { FormHelper } from "../../Framework/forms";
import { backToEditSubmission, backToSubmissions, backToAdminOverview } from "../../Components/Admin/go-back-links";


/**
 * Page for editing a gameplay event
 * @param {string[]} parameters - route parameters. parameters[0] = event ID, parameters[1] = video ID, parameters[2] = submission ID
 */
function EditGameplayEventPage(parameters) {
    this.eventId = parseInt(parameters[0], 10);
    this.videoId = parameters[1];
    this.submissionId = parseInt(parameters[2], 10);
    this.link = new AdminLink();
    this.formHelper = new FormHelper();
}


EditGameplayEventPage.prototype = {
    renderPage: function () {
        new Html([
            Div(
                t('loading gameplay event...')
            )
        ]);
    },


    loadAndDisplayGameplayEvent: function () {
        get(`/Admin/GameplayEvent/${this.eventId.toString(10)}`).then(event => {
            new Html([
                Div(
                    h1(
                        t('Edit Event')
                    ),
                    hr(),
                    h2(
                        t('Change Type')
                    ),
                    p(
                        t('Current Type: ' + gameplayEventTypeToString(event.event_type))
                    ),
                    form(
                        attr({ method: 'post' }),
                        event('submit', e => this.formHelper.handleSubmit(e, `/Admin/update_gameplay_event_type`, true, this.link.editGameplayEvent(event.id), true, true, true)),
                        input(
                            attr({
                                type: 'hidden',
                                name: 'GameplayEventId',
                                value: event.id
                            }),

                            div(
                                select(
                                    event('input', e => this.formHelper.validateForm(e)),
                                    attr({
                                        required: 'true',
                                        requiredError: 'Event Type must be selected',
                                    }),

                                    ...gameplayEventTypeOptionList(event.event_type)
                                )
                            ),
                            div(
                                formButton(
                                    t('Change Event Type')
                                )
                            )
                        )
                    ),
                    hr(),

                    div(
                        t('todo: update all other stuff!')
                    ),

                    hr(),
                    backToEditSubmission(event.video_id, this.submissionId),
                    backToSubmissions(),
                    backToAdminOverview()
                )
            ])
        });
    }
}


function registerEditGameplayEventPage() {
    registerPage(EditGameplayEventPage, 'Edit Gameplay Event', ['Admin', 'EditGameplayEvent', '{gameplayEventId}', '{videoId}', '{submissionId}']);
}



export {
    EditGameplayEventPage,
    registerEditGameplayEventPage
}

