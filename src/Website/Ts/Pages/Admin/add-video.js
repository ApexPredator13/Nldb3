import { Html, Div, div, id, form, attr, label, textarea, formButton, hr } from "../../Framework/renderer";
import { registerPage } from "../../Framework/router";
import { backToAdminOverview } from "../../Components/Admin/go-back-links";
import { AdminLink } from "./_admin-link-creator";
import { FormHelper } from "../../Framework/forms";


/**
 * page for adding / updating episodes from youtube via youtube API
 * @constructor
 */
function AddVideoPage() {
    this.formHelper = new FormHelper();
    this.link = new AdminLink();
}


AddVideoPage.prototype = {

    /** renders the page */
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t('Add Videos')
                ),
                p(
                    t('Enter video IDs seperated by a comma \',\'. New videos will be saved, existing videos will be updated.')
                ),
                p(
                    id('errors')
                ),
                form(
                    attr({ method: 'post' }),
                    event('submit', e => this.formHelper.handleSubmit(e, '/Admin/save_or_update_videos', true, this.link.videosSaved(document.getElementById('video-ids-textarea').value))),

                    div(
                        label(
                            t('Video IDs')
                        ),
                        textarea(
                            attr({
                                placeholder: 'enter video ids, seperated by a comma \',\'',
                                required: 'true',
                                requiredError: 'This field is required',
                                minlength: '11',
                                minlengthError: 'Must be at least 11 characters long',
                                name: 'VideoIds',
                                id: 'video-ids-textarea'
                            }),
                            event('input', e => this.formHelper.validateForm(e))
                        )
                    ),
                    div(
                        formButton(
                            t('Save/Update videos')
                        )
                    )
                ),
                hr(),
                backToAdminOverview()
            )
        ]);
    }
};


function registerAddVideoPage() {
    registerPage(AddVideoPage, 'Add or update videos', ['Admin', 'AddVideo'])
}


export {
    AddVideoPage,
    registerAddVideoPage
}



