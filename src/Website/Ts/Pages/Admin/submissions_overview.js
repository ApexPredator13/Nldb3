import { Html, Div, h1, hr, div, id, button, event, P, cl, Table, thead, tbody, tr, td, th, t } from "../../Framework/renderer";
import { get } from "../../Framework/http";
import { registerPage, navigate } from "../../Framework/router";
import { convertSubmissionTypeToString } from "../../Enums/enum-to-string-converters";
import { AdminLink } from "./_admin-link-creator";


/**
 * submissions overview page
 * @constructor
 */
function SubmissionsOverviewPage() {
    this.limit = 50;
    this.offset = 0;
    this.link = new AdminLink();
}


SubmissionsOverviewPage.prototype = {

    /** renders the initial layout */
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t('Submissions')
                ),
                hr(),
                div(
                    id('submissions')
                ),
                div(
                    button(
                        t('Previous 50'),
                        event('click', e => this.next(e))
                    ),
                    button(
                        t('Next 50'),
                        event('click', e => this.prev(e))
                    )
                )
            )
        ]);

        this.loadSubmissions();
    },


    /**
     * goes one page forward
     * @param {Event} e - the raw button click event
     */
    next: function (e) {
        e.preventDefault();
        this.offset += 50;
        this.loadSubmissions();
    },


    /**
     * goes one page backwards
     * @param {Event} e - the raw button click event
     */
    prev: function (e) {
        e.preventDefault();
        if (this.offset <= 0) {
            return;
        }

        this.offset -= 50;
        this.loadSubmissions();
    },


    /** loads submissions, displays them */
    loadSubmissions: function () {
        get(`/Admin/Submissions/${this.limit.toString(10)}/${this.offset.toString(10)}`, true).then(submissions => {
            if (!submissions || submissions.length === 0) {
                new Html([
                    P(
                        t('No submissions found.')
                    )
                ], 'submissions');
            } else {
                new Html([
                    Table(
                        thead(
                            tr(
                                th(
                                    t('Id')
                                ),
                                th(
                                    t('Title')
                                ),
                                th(
                                    t('Username')
                                ),
                                th(
                                    t('Latest')
                                ),
                                th(
                                    t('Type')
                                )
                            )
                        ),
                        tbody(
                            ...submissions.map(submission => tr(
                                td(
                                    cl('u', 'hand'),
                                    t(submission.submission_id.toString(10)),
                                    event('click', e => navigate(this.link.editSubmission(submission.video_id, submission.submission_id)))
                                ),
                                td(
                                    t(submission.video_title)
                                ),
                                td(
                                    t(submission.user_name)
                                ),
                                td(
                                    t(submission.latest ? 'latest submission' : '')
                                ),
                                td(
                                    t(convertSubmissionTypeToString(submission.submission_type))
                                )
                            ))
                        )
                    )
                ], 'submissions');
            }
        });
    }
}


function registerSubmissionsOverviewPage() {
    registerPage(SubmissionsOverviewPage, 'Submissions', ['Admin', 'Submissions']);
}


export {
    SubmissionsOverviewPage,
    registerSubmissionsOverviewPage
}


