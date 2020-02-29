import { AdminLink } from "./_admin-link-creator";
import { Html, Div, h1, t, hr, p, a, href, cl, event } from "../../Framework/renderer";
import { navigate, registerPage } from "../../Framework/router";
import { backToAdminOverview } from '../../Components/Admin/go-back-links';


function TestEmailSentPage() { 
    this.link = new AdminLink();
}

TestEmailSentPage.prototype = {
    renderPage: function() {
        new Html([
            Div(
                h1(
                    t('Email sent!')
                ),
                hr(),
                p(
                    a(
                        t('← Send another email'),
                        cl('u', 'hand'),
                        event('click', e => navigate(this.link.sendTestEmail(), e))
                    )
                ),
                backToAdminOverview()
            )
        ]);
    }
}


function registerTestEmailSentPage() {
    registerPage(TestEmailSentPage, 'Test Email Sent!', ['Admin', 'TestEmailSent']);
}

export {
    TestEmailSentPage,
    registerTestEmailSentPage
}