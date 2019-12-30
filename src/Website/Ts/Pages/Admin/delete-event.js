import { Html, Div, h1, t, event, attr, form, hr, input, div, button } from "../../Framework/renderer";
import { AdminLink } from "./_admin-link-creator";
import { registerPage } from "../../Framework/router";
import { FormHelper } from "../../Framework/forms";
import { backToEditSubmission, backToSubmissions, backToAdminOverview } from "../../Components/Admin/go-back-links";


/**
 * page for deleting a gameplay event
 * @constructor
 * @param {string[]} parameters - route parameters. [0] = video ID, [1] = submission ID, [2] = event ID
 */
function DeleteEventPage(parameters) {
    this.videoId = parameters[0];
    this.submissionId = parseInt(parameters[1], 10);
    this.eventId = parseInt(parameters[2], 10);
    this.formHelper = new FormHelper();
    this.link = new AdminLink();
}


DeleteEventPage.prototype = {
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t('Delete Event with ID ${this.eventId}?')
                ),
                hr(),
                form(
                    attr({ method: 'post' }),
                    event('submit', e => this.formHelper.handleSubmit(e, '/Admin/delete_gameplay_event', true, this.link.editSubmission(this.videoId, this.submissionId))),

                    input(
                        attr({
                            type: 'hidden',
                            name: 'GameplayEventId',
                            value: this.eventId.toString(10)
                        })
                    ),

                    div(
                        button(
                            t('Yes, Delete!'),
                            attr({ type: 'submit' })
                        )
                    )
                ),

                hr(),

                backToEditSubmission(this.videoId, this.submissionId),
                backToSubmissions(),
                backToAdminOverview()
            )
        ])
    }
}


function registerDeleteEventPage() {
    registerPage(DeleteEventPage, 'Delete Event', ['Admin', 'DeleteEvent', '{videoId}', '{submissionId}', '{eventId}']);
}


export {
    DeleteEventPage,
    registerDeleteEventPage
}

