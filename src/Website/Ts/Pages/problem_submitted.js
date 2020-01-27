import { registerPage, navigate } from "../Framework/router";
import { Link } from "./_link-creator";
import { Html, H1, t, Hr, P, a, href, event } from "../Framework/renderer";

function ProblemSubmittedPage() {
    this.link = new Link();
}

ProblemSubmittedPage.prototype = {
    renderPage: function() {
        new Html([
            H1(
                t('Submitted Successfully!')
            ),
            Hr(),
            P(
                t('Thanks for taking the time to make this website a better place.')
            ),
            P(
                a(
                    t('Back to the front page'),
                    href(this.link.home()),
                    event('click', e => navigate(this.link.home(), e))
                )
            )
        ]);
    }
};

function registerProblemSubmittedPage() {
    registerPage(ProblemSubmittedPage, 'Problem Submitted', ['ProblemSubmitted']);
}

export {
    ProblemSubmittedPage,
    registerProblemSubmittedPage
}

