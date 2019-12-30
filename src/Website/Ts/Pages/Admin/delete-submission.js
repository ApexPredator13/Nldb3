import { Html, Div, h1, t, hr, form, attr, event, input, button } from "../../Framework/renderer";
import { registerPage } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { FormHelper } from "../../Framework/forms";
import { backToEditSubmission, backToSubmissions, backToAdminOverview } from "../../Components/Admin/go-back-links";


/**
 * page for deleting an entire submission
 * @constructor
 * @param {string[]} parameters - route parameters. parameters[0] = submission ID, parameters[1] = video ID
 */
function DeleteSubmissionPage(parameters) {
    this.submissionId = parseInt(parameters[0], 10);
    this.videoId = parameters[1];
    this.formHelper = new FormHelper();
    this.link = new AdminLink();
}


DeleteSubmissionPage.prototype = {
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t(`Really Delete Submission with ID ${this.submissionId.toString(10)}?`)
                ),
                hr(),
                form(
                    attr({ method: 'post' }),
                    event('submit', e => this.formHelper.handleSubmit(e, '/Admin/delete_submission', true, this.link.submissions())),

                    input(
                        attr({
                            type: 'hidden',
                            name: 'SubmissionId',
                            value: this.submissionId.toString(10)
                        })
                    ),

                    button(
                        t('Yes, Delete Submission!'),
                        attr({ type: 'submit' })
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

function registerDeleteSubmissionPage() {
    registerPage(DeleteSubmissionPage, 'Delete Submission', ['Admin', 'DeleteSubmission', '{submissionId}', '{videoId}'])
}


export {
    DeleteSubmissionPage,
    registerDeleteSubmissionPage
}


