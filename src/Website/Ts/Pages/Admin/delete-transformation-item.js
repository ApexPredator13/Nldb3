import { FormHelper } from "../../Framework/forms";
import { a, attr, button, Div, event, form, formButton, h1, H1, hr, Html, p, t } from "../../Framework/renderer";
import { navigate, registerPage } from "../../Framework/router"
import { AdminLink } from "./_admin-link-creator";

function DeleteTransformationItem(parameters) {
    this.link = new AdminLink();
    this.formHelper = new FormHelper();
    this.transformationId = parameters[0];
    this.isaacResourceId = parameters[1];
}


DeleteTransformationItem.prototype = {
    renderPage: function() {
        new Html([
            Div(
                h1(
                    t(`Really delete ${this.isaacResourceId} from ${this.transformationId}?`)
                ),
                hr(),
                form(
                    attr({
                        method: 'post'
                    }),
                    event('submit', e => this.formHelper.handleSubmit(e, `/Admin/make-untransformative/${this.transformationId}/${this.isaacResourceId}`, true, this.link.editTransformation(this.transformationId))),
                    button(
                        t('Yes, delete!!'),
                        attr({
                            type: 'submit'
                        })
                    )
                ),
                p(
                    a(
                        attr({
                            href: this.link.editTransformation(this.transformationId),
                        }),
                        t('Go Back'),
                        event('click', e => navigate(this.link.editTransformation(this.transformationId), e))
                    )
                )
            )
        ]);
    }
}


function registerDeleteTransformationItemPage() {
    registerPage(DeleteTransformationItem, 'Delete transformation item', ['Admin', 'DeleteTransformationItem', '{transformationId}', '{isaacResourceId}']);
}


export {
    registerDeleteTransformationItemPage,
    DeleteTransformationItem
}