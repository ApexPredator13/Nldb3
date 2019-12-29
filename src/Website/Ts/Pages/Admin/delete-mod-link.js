import { AdminLink } from "./_admin-link-creator";
import { FormHelper } from "../../Framework/forms";
import { Render, Div, h1, t, event, hr, form, input, attr, div, button } from "../../Framework/renderer";
import { backToAdminOverview, backToMods, backToMod } from "../../Components/Admin/go-back-links";
import { registerPage } from "../../Framework/router";


/**
 * page for deleting mod links
 * @constructor
 * @param {string[]} parameters - route parameters. parameters[0] = link ID, parameters[1] = link display text, parameters[2] = mod ID
 */
function DeleteModLinkPage(parameters) {
    this.link = new AdminLink();
    this.formHelper = new FormHelper();
    this.linkText = parameters[1];
    this.modId = parseInt(parameters[2], 10);
    this.linkId = parseInt(parameters[0], 10);
}


DeleteModLinkPage.prototype = {
    renderPage: function () {
        new Render([
            Div(
                h1(
                    t(`Delete Link '${this.linkText}'?`)
                ),
                hr(),
                form(
                    event('submit', e => this.formHelper.handleSubmit(e, '/Admin/delete_mod_link', true, this.link.mod(this.modId))),

                    input(
                        attr({
                            type: 'hidden',
                            name: 'LinkId',
                            value: this.linkId
                        })
                    ),

                    div(
                        button(
                            t('Yes, delete!'),
                            attr({ type: 'submit' })
                        )
                    )
                ),
                hr(),
                backToMod(this.modId),
                backToMods(),
                backToAdminOverview()
            )
        ]);
    }
}


function registerDeleteModLinkPage() {
    registerPage(DeleteModLinkPage, 'Delete mod link', ['Admin', 'DeleteModLink', '{linkId}', '{linkDisplayText}', '{modId}'])
}


export {
    DeleteModLinkPage,
    registerDeleteModLinkPage
}

