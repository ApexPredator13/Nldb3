import { Html, Div, h1, t, hr } from "../../Framework/renderer";
import { AdminLink } from "./_admin-link-creator";
import { registerPage } from "../../Framework/router";
import { backToResources, backToAdminOverview } from "../../Components/Admin/go-back-links";



/**
 * page that is displayed after a resource was deleted
 * @param {string[]} parameters - route parameters. parameters[0] = resource type, parameters[1] = resource ID
 */
function ResourceDeletedPage(parameters) {
    this.link = new AdminLink();
    this.resourceType = parseInt(parameters[0], 10);
    this.resourceId = parameters[1];
}


ResourceDeletedPage.prototype = {
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t(`Resource '${this.resourceId}' was deleted.`)
                ),
                hr(),
                backToResources(this.resourceType),
                backToAdminOverview()
            )
        ]);
    }
}


function registerResourceDeletedPage() {
    registerPage(ResourceDeletedPage, 'Resource Deleted.', ['Admin', 'ResourceDeleted', '{resourceType}', '{resourceId}']);
}


export {
    ResourceDeletedPage,
    registerResourceDeletedPage
}

