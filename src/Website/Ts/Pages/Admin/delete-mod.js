import { Render, Div, h1, t, hr, form, attr, div, button, input } from "../../Framework/renderer"
import { FormHelper } from "../../Framework/forms";
import { AdminLink } from "./_admin-link-creator";
import { backToMods, backToAdminOverview } from "../../Components/Admin/go-back-links";
import { registerPage } from "../../Framework/router";


/**
 * page for deleting mods
 * @constructor
 * @param {string[]} parameters - route parameters. parameters[0] = mod ID, parameters[1] = mod name
 */
function DeleteModPage(parameters) {
    this.modId = parseInt(parameters[0], 10);
    this.modName = parameters[1];
    this.formHelper = new FormHelper();
    this.link = new AdminLink();
}


DeleteModPage.prototype = {
    renderPage: function () {
        new Render([
            Div(
                h1(
                    t(`Really delete "${this.modName}"?`)
                ),
                hr(),
                form(
                    attr({ method: 'post' }),
                    event('submit', e => this.formHelper.handleSubmit(e, '/Admin/delete_mod', true, this.link.mods())),

                    input(
                        attr({
                            type: 'hidden',
                            name: 'ModId',
                            value: this.modId
                        })
                    ),

                    div(
                        button(
                            t('Yes, Delete!'),
                            attr({ type: 'submit' })
                        )
                    )
                ),
                hr(),
                backToMods(),
                backToAdminOverview()
            )
        ]);
    }
}


function registerDeleteModPage() {
    registerPage(DeleteModPage, 'Delete Mod', ['Admin', 'DeleteMod', '{modId}', '{modName}'])
}


export {
    DeleteModPage,
    registerDeleteModPage
}

