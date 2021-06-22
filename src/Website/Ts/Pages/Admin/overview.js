import { Html, event, H1, Hr, P, span, t, cl } from "../../Framework/renderer";
import { registerPage, navigate } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { getFromLocalStorage } from "../../Framework/browser";


/**
 * the admin backend entry point
 * @constructor
 */
function AdminOverview() {

    /** @type {number} */
    this.lastSelectedResourceTypeOrDefault = getFromLocalStorage('last_selected_resource_type') || 6;

    /** @type {AdminLink} */
    this.link = new AdminLink();
}


AdminOverview.prototype = {

    /** creates the page */
    renderPage: function () {
        new Html([
            H1(
                t('Admin Area')
            ),
            Hr(),
            P(
                span(
                    t('Manage Mods'),
                    cl('u', 'hand'),
                    event('click', e => navigate(this.link.mods(), e))
                )
            ),
            P(
                span(
                    t('Manage Isaac Content'),
                    cl('u', 'hand'),
                    event('click', e => navigate(this.link.resourceOverview(this.lastSelectedResourceTypeOrDefault), e))
                )
            ),
            P(
                span(
                    t('Manually add/update videos'),
                    cl('u', 'hand'),
                    event('click', e => navigate(this.link.addVideos(), e))
                )
            ),
            P(
                span(
                    t('Manage Submissions'),
                    cl('u', 'hand'),
                    event('click', e => navigate(this.link.submissions(), e))
                )
            ),
            P(
                span(
                    t('Test Email-Service'),
                    cl('u', 'hand'),
                    event('click', e => navigate(this.link.sendTestEmail(), e))
                )
            ),
            P(
                span(
                    t('Edit Transformations'),
                    cl('u', 'hand'),
                    event('click', e => navigate(this.link.transformationsOverview(), e))
                )
            ),
            P(
                span(
                    t('Validate Submission Transformation Correctness'),
                    cl('u', 'hand'),
                    event('click', e => navigate(this.link.validateSubmissions(), e))
                )
            )
        ]);
    }
};


function registerAdminOverviewPage() {
    registerPage(AdminOverview, 'Admin Overview', ['Admin', 'Overview']);
}


export {
    AdminOverview,
    registerAdminOverviewPage
}
