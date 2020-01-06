import { Html, Div, h1, t, hr, form, attr, fieldset, div, cl, label, input, select, option, formButton, event } from "../../Framework/renderer";
import { registerPage } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { gameplayEventTypeOptionList } from "../../Components/Admin/option-lists";
import { FormHelper } from "../../Framework/forms";
import { backToEditSubmission, backToSubmissions, backToAdminOverview } from "../../Components/Admin/go-back-links";


/**
 * page for inserting a gameplay event
 * @constructor
 * @param {string[]} parameters - route parameters. [0] = video ID, [1] = submission ID, [2] = event ID after which to insert, [3] = ID of played character, [4] = ID of played floor, [5] = number of run, [6] = number of floor
 */
function InsertGameplayEventPage(parameters) {
    this.videoId = parameters[0];
    this.submissionId = parseInt(parameters[1], 10);
    this.insertAfterEventId = parseInt(parameters[2], 10);
    this.playedCharacterId = parseInt(parameters[3], 10);
    this.playedFloorId = parseInt(parameters[4], 10);
    this.runNumber = parseInt(parameters[5], 10);
    this.floorNumber = parseInt(parameters[6], 10);

    this.formHelper = new FormHelper();
    this.link = new AdminLink();
}



InsertGameplayEventPage.prototype = {
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t('Insert gameplay event')
                ),
                hr(),
                form(
                    attr({ method: 'post' }),
                    event('submit', e => this.formHelper.handleSubmit(e, '/Admin/insert_gameplay_event', true, this.link.editSubmission(this.videoId, this.submissionId))),

                    fieldset(
                        div(
                            cl('fc'),
                            label(
                                t('Insert after event with ID')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    required: 'true',
                                    requiredError: 'event ID is required',
                                    name: 'InsertAfterEvent',
                                    value: this.insertAfterEventId.toString(10)
                                })
                            )
                        ),
                        div(
                            cl('fc'),
                            label(
                                t('Video ID')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'text',
                                    required: 'true',
                                    requiredError: 'video ID is required',
                                    name: 'VideoId',
                                    value: this.videoId
                                })
                            )
                        ),
                        div(
                            cl('fc'),
                            label(
                                t('Played Character ID')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    required: 'true',
                                    requiredError: 'played character ID is required',
                                    name: 'PlayedCharacterId',
                                    value: this.playedCharacterId.toString(10)
                                })
                            )
                        ),
                        div(
                            cl('fc'),
                            label(
                                t('Played Floor ID')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    required: 'true',
                                    requiredError: 'played floor ID is required',
                                    name: 'PlayedFloorId',
                                    value: this.playedFloorId.toString(10)
                                })
                            )
                        ),
                        div(
                            cl('fc'),
                            label(
                                t('Run Number')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    required: 'true',
                                    requiredError: 'run number is required',
                                    name: 'RunNumber',
                                    value: this.runNumber.toString(10)
                                })
                            )
                        ),
                        div(
                            cl('fc'),
                            label(
                                t('Floor Number')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    required: 'true',
                                    requiredError: 'floor number is required',
                                    name: 'FloorNumber',
                                    value: this.floorNumber.toString(10)
                                })
                            )
                        ),
                        div(
                            cl('fc'),
                            label(
                                t('Event was consequence of event with id (used only for transformation that completed after picking up transformation item #3):')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    name: 'InConsequenceOf'
                                })
                            )
                        )
                    ),

                    fieldset(
                        div(
                            cl('fc'),
                            label(
                                t('Gameplay event type')
                            ),
                            select(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    name: 'NewEvent.EventType',
                                    required: 'true',
                                    requiredError: 'a gameplay event must be selected'
                                }),
                                ...gameplayEventTypeOptionList(2)
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Resource 1')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'text',
                                    name: 'NewEvent.RelatedResource1',
                                    required: 'true',
                                    requiredError: 'resource 1 is always required!'
                                })
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Resource 2')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'text',
                                    name: 'NewEvent.RelatedResource2'
                                })
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Resource 3 (used for transformation progress only)')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    name: 'NewEvent.RelatedResource3'
                                })
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Current Player (empty for: down to next floor, bossfight, curse, won the run, character died, lost the run)')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    name: 'NewEvent.Player'
                                })
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Was Rerolled? (default is false for everything)')
                            ),
                            select(
                                attr({
                                    name: 'NewEvent.Rerolled',
                                    required: 'true',
                                    requiredError: 'must be selected - default is false for all events'
                                }),
                                event('input', e => this.formHelper.validateForm(e)),
                                option('true', 'True', false),
                                option('false', 'False', true)
                            )
                        ),
                    ),
                    div(
                        formButton(
                            t('Insert Event')
                        )
                    )
                ),

                hr(),

                backToEditSubmission(this.videoId, this.submissionId),
                backToSubmissions(),
                backToAdminOverview()
            )
        ]);
    }
}



function registerInsertGameplayEventPage() {
    registerPage(InsertGameplayEventPage, 'Insert Event', ['Admin', 'InsertGameplayEvent', '{videoId}', '{SubmissionId}', '{InsertAfterEventId}', '{playedCharacterId}', '{playedFloorId}', '{runNumber}', '{floorNumber}']);
}



export {
    InsertGameplayEventPage,
    registerInsertGameplayEventPage
}


