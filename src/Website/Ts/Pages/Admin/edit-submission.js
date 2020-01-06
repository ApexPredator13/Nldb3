import { Html, t, p, div, Div, h1, id, hr, span, cl, event, Table, thead, tr, th, tbody, td, attr } from "../../Framework/renderer";
import { registerPage, navigate } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { get } from "../../Framework/http";
import { isaacImage } from "../../Components/General/isaac-image";
import { gameplayEventTypeToString } from "../../Enums/enum-to-string-converters";
import { backToSubmissions, backToAdminOverview } from "../../Components/Admin/go-back-links";


/**
 * page for editing a submission
 * @constructor
 * @param {string[]} parameters - route parameters. parameters[0] = video ID, parameters[1] = submission ID
 */
function EditSubmissionPage(parameters) {
    this.videoId = parameters[0];
    this.submissionId = parseInt(parameters[1], 10);
    this.link = new AdminLink();
}



EditSubmissionPage.prototype = {
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t('Edit played characters')
                ),
                div(
                    id('edit-characters'),
                    t('loading...')
                ),
                hr(),
                h1(
                    t('Edit floors')
                ),
                div(
                    id('edit-floors'),
                    t('loading...')
                ),
                hr(),
                h1(
                    t('Edit events')
                ),
                div(
                    id('edit-events'),
                    t('loading...')
                ),
                hr(),
                div(
                    p(
                        span(
                            cl('u', 'hand'),
                            event('click', e => navigate(this.link.deleteSubmission(this.submissionId, this.videoId), e)),
                            t('Delete Submission')
                        )
                    )
                ),
                hr(),
                backToSubmissions(),
                backToAdminOverview(),
            )
        ]);

        this.loadPlayedCharacters();
        this.loadPlayedFloors();
        this.loadGameplayEvents();
    },


    loadPlayedCharacters: function () {
        get(`/Admin/Submissions/${this.videoId}/${this.submissionId}/Characters`, true).then(characters => {
            new Html([
                Table(
                    thead(
                        tr(
                            th(
                                t('Played Character'),
                                attr({ colspan: '2' })
                            ),
                            th(
                                t('Action #')
                            )
                        )
                    ),
                    tbody(
                        ...characters.map(character => tr(
                            td(
                                isaacImage(character.character, undefined, false)
                            ),
                            td(
                                t(character.character.name),
                                cl('u', 'hand'),
                                // todo: -> go to character edit page
                            )
                        ))
                    )
                )
            ], 'edit-characters');
        });
    },


    loadPlayedFloors: function () {
        get(`/Admin/Submissions/${this.videoId}/${this.submissionId}/Floors`, true).then(floors => {
            new Html([
                Table(
                    thead(
                        tr(
                            th(
                                t('Played Floor'),
                                attr({ colspan: '2' })
                            ),
                            th(
                                t('Action #')
                            ),
                            th(
                                t('Duration')
                            ),
                            th(
                                t('Floor Number')
                            )
                        )
                    ),
                    tbody(
                        ...floors.map(floor => tr(
                            td(
                                isaacImage(floor.floor, undefined, false)
                            ),
                            td(
                                t(floor.floor.name),
                                cl('u', 'hand'),
                                // todo: -> go to edit floor page
                            ),
                            td(
                                t(floor.action.toString(10))
                            ),
                            td(
                                t(floor.duration.toString(10))
                            ),
                            td(
                                t(floor.floor_number.toString(10))
                            )
                        ))
                    )
                )
            ], 'edit-floors');
        });
    },


    loadGameplayEvents: function () {
        get(`/Admin/Submissions/${this.videoId}/${this.submissionId}/Events`, true).then(events => {
            new Html([
                Table(
                    thead(
                        tr(
                            th(
                                t('Id')
                            ),
                            th(
                                t('Action #')
                            ),
                            th(
                                t('Event'),
                                attr({ colspan: '4' })
                            )
                        )
                    ),
                    tbody(
                        ...events.map(ev => tr(
                            td(
                                t(ev.id.toString(10))
                            ),
                            td(
                                t(ev.action.toString(10))
                            ),
                            td(
                                isaacImage(ev, 1, false)
                            ),
                            td(
                                t(gameplayEventTypeToString(ev.event_type)),
                                event('click', e => navigate(this.link.editGameplayEvent(ev.id, this.videoId, this.submissionId), e)),
                                cl('u', 'hand')
                            ),
                            td(
                                t('delete'),
                                event('click', e => navigate(this.link.deleteEvent(this.videoId, this.submissionId, ev.id), e)),
                                cl('u', 'hand')
                            ),
                            td(
                                t('insert event'),
                                event('click', e => navigate(this.link.insertGameplayEvent(this.videoId, this.submissionId, ev.id, ev.played_character, ev.played_floor, ev.run_number, ev.floor_number), e)),
                                cl('u', 'hand')
                            )
                        ))
                    )
                )
            ], 'edit-events');
        });
    }
}


function registerEditSubmissionPage() {
    registerPage(EditSubmissionPage, 'Edit Submission', ['Admin', 'EditSubmission', '{videoId}', '{submissionId}'])
}


export {
    EditSubmissionPage,
    registerEditSubmissionPage
}


