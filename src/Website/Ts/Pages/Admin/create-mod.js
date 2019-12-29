import { Div, h1, t, form, label, input, event, attr, hr, div, formButton } from "../../Framework/renderer";
import { registerPage } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { FormHelper } from "../../Framework/forms";
import { backToMods, backToAdminOverview } from "../../Components/Admin/go-back-links";


/**
 * Page for adding new mods to the database
 * @constructor
 */
function CreateModPage() {
    this.formHelper = new FormHelper();
    this.link = new AdminLink();
}


CreateModPage.prototype = {

    renderPage: function () {
        Div(
            h1(
                t('New Mod')
            ),
            hr(),
            form(
                attr({ method: 'post' }),
                event('submit', e => this.formHelper.handleSubmit(e, '/Admin/create_mod', true, this.link.mods())),

                div(
                    label(
                        t('Mod Name')
                    ),
                    input(
                        attr({
                            type: 'text',
                            name: 'ModName',
                            maxlength: '256',
                            maxlengthError: 'Name is too long',
                            required: 'true'
                        }),
                        event('input', e => this.formHelper.validateForm(e))
                    )
                ),
                div(
                    formButton(
                        t('Create Mod')
                    )
                )
            ),
            hr(),
            backToMods(),
            backToAdminOverview()
        )
    }
}


function registerCreateModPage() {
    registerPage(CreateModPage, 'Create new mod', ['Admin', 'CreateMod']);
}


export {
    CreateModPage,
    registerCreateModPage
}

