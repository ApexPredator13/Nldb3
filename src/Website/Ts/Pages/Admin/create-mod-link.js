import { Html, Div, h2, t, hr, form, attr, event, input, div, cl, label, formButton } from "../../Framework/renderer";
import { AdminLink } from "./_admin-link-creator";
import { registerPage } from "../../Framework/router";
import { FormHelper } from "../../Framework/forms";
import { backToMod, backToMods, backToAdminOverview } from "../../Components/Admin/go-back-links";


/**
 * page for creating external mod links
 * @param {string[]} parameters - route parameters. parameters[0] = modId
 */
function CreateModLinkPage(parameters) {
    this.modId = parseInt(parameters[0], 10);
    this.link = new AdminLink();
    this.formHelper = new FormHelper();
}



CreateModLinkPage.prototype = {

    renderPage: function () {
        new Html([
            Div(
                h2(
                    t('Create Link for Mod')
                ),
                hr(),

                form(
                    attr({ method: 'post' }),
                    event('submit', e => this.formHelper.handleSubmit(e, '/Admin/create_mod_link', true, this.link.mod(this.modId))),

                    input(
                        attr({
                            type: 'hidden',
                            name: 'ModId',
                            value: this.modId.toString(10)
                        })
                    ),

                    div(
                        cl('fc'),
                        label(
                            t('Display Text')
                        ),
                        input(
                            attr({
                                name: 'LinkText',
                                type: 'text',
                                required: 'true',
                                requiredError: 'Link text is required',
                                maxlength: '100',
                                maxlengthError: 'Link is too long'
                            }),
                            event('input', e => this.formHelper.validateForm(e))
                        )
                    ),

                    div(
                        cl('fc'),
                        label(
                            t('URL')
                        ),
                        input(
                            attr({
                                name: 'Url',
                                type: 'text',
                                required: 'true',
                                requiredError: 'Url is required',
                            }),
                            event('input', e => this.formHelper.validateForm(e))
                        )
                    ),
                    div(
                        formButton(
                            t('Save Link')
                        )
                    )
                ),
                hr(),
                backToMod(this.modId),
                backToMods(),
                backToAdminOverview()
            )
        ])
    }
}

function registerCreateModLinkPage() {
    registerPage(CreateModLinkPage, 'Create Link', ['Admin', 'CreateLink', '{modId}']);
}


export {
    CreateModLinkPage,
    registerCreateModLinkPage
}

