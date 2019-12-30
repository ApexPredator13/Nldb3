import { Html, Div, h1, t, hr, form, attr, input, div, formButton } from "../../Framework/renderer";
import { AdminLink } from "./_admin-link-creator";
import { registerPage } from "../../Framework/router";
import { FormHelper } from "../../Framework/forms";
import { backToAdminOverview, backToResourceEditPage, backToResources } from "../../Components/Admin/go-back-links";

/**
 * page for deleting a resource
 * @constructor
 * @param {string[]} parameters - route parameters- parameters[0] is the resource type, parameters[1] is the resource ID
 */
function DeleteResourcePage(parameters) {
    this.formHelper = new FormHelper();
    this.link = new AdminLink();
    this.resourceType = parseInt(parameters[0], 10);
    this.resourceId = parameters[1];
}


DeleteResourcePage.prototype = {
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t(`Delete Resource with ID ${this.resourceId}?`)
                ),
                hr(),
                form(
                    attr({ method: 'post' }),
                    event('submit', e => this.formHelper.handleSubmit(e, '/Admin/delete_isaac_resource', true, this.link.resourceDeleted(this.resourceType, this.resourceId))),

                    input(
                        attr({
                            type: 'hidden',
                            name: 'ResourceId',
                            value: this.resourceId
                        })
                    ),

                    div(
                        formButton(
                            t('Yes, Delete!')
                        )
                    )
                ),

                backToResourceEditPage(this.resourceId),
                backToResources(this.resourceType),
                backToAdminOverview()
            )
        ])
    }
}


function registerDeleteResourcePage() {
    registerPage(DeleteResourcePage, 'Delete Resource', ['Admin', 'DeleteResource', '{resourceType}', '{resourceId}']);
}


export {
    DeleteResourcePage,
    registerDeleteResourcePage
}

