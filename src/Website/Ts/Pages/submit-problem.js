import { Html, Div, h1, hr, p, t, textarea, attr, form, event, div, formButton } from '../Framework/renderer';
import { Link } from './_link-creator';
import { registerPage, initRouter } from '../Framework/router';
import { FormHelper } from '../Framework/forms';

/**
 * page for submitting bug reports and feature requests
 * @constructor
 */
function SubmitProblemPage() {
    this.link = new Link();
    this.form = new FormHelper();
}

SubmitProblemPage.prototype = {
    renderPage: function() {
        new Html([
            Div(
                h1(
                    t('Problem reporting')
                ),
                hr(),
                p(
                    t('Problems with the website or any feature requests? Please feel free to put anything you want into this textbox:')
                ),
                form(
                    event('submit', e => this.form.handleSubmit(e, '/frontpage/bug_report', false, this.link.problemSubmitted())),
                    div(
                        textarea(
                            event('input', e => this.form.validateForm(e)),
                            attr({
                                cols: '20',
                                rows: '5',
                                maxlength: '500',
                                placeholder: 'bugs, feature requests, or whatever you feel like sharing!',
                                name: 'Text'
                            })
                        )
                    ),
                    div(
                        formButton(
                            t('Submit')
                        )
                    )
                )
            )
        ]);
    }
}

function registerReportProblemPage() {
    registerPage(SubmitProblemPage, 'Submit Problem', ['ReportProblem'])
}

(() => {
    registerReportProblemPage();
    initRouter();
})();

export {
    SubmitProblemPage,
    registerReportProblemPage
}

