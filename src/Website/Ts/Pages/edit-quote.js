import { registerPage, navigate } from "../Framework/router";
import { Html, H1, t, Hr, Div, h2, form, event, textarea, attr, input, div, formButton, modal, p, button } from "../Framework/renderer";
import { getUser } from "../Framework/Customizable/authentication";
import { get } from "../Framework/http";
import { FormHelper } from "../Framework/forms";
import { Link } from "./_link-creator";
import { modalContent } from "../Framework/Customizable/Layout/modal-content";


/**
 * Page for editing a single quote
 * @param {string[]} parameters - route parameters. parameters[0] = quote ID
 */
function EditQuotePage(parameters) {

    /** @type {number} */
    this.quoteId = parseInt(parameters[0], 10);

    /** @type {FormHelper} */
    this.formHelper = new FormHelper();

    /** @type {Link} */
    this.link = new Link();
}


EditQuotePage.prototype = {

    /** creates the initial Html */
    renderPage: function () {
        new Html([
            H1(
                t('Loading quote...')
            )
        ]);
        this.loadUser();
    },


    loadUser: function () {
        getUser().then(user => {
            if (user) {
                this.loadQuoteAndDisplayForm();
            } else {
                new Html([
                    H1('Please log yourself in before editing.')
                ]);
            }
        })
    },


    loadQuoteAndDisplayForm: function () {
        get(`/Api/Quotes/single/${this.quoteId.toString(10)}`).then(quote => {
            new Html([
                H1(
                    t(`Editing quote #${quote.id}`)
                ),
                Hr(),
                Div(
                    form(
                        attr({ method: 'post' }),
                        event('submit', e => this.formHelper.handleSubmit(e, '/Api/Quotes/update', true, this.link.editQuote(this.quoteId), false, true, true)),
                        input(
                            attr({
                                type: 'hidden',
                                name: 'Id',
                                value: this.quoteId
                            })
                        ),

                        div(
                            p(
                                t('Quote Text')
                            ),
                            textarea(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    required: 'true',
                                    required_error: 'Quote text cannot be empty!',
                                    minlength: '10',
                                    minlength_error: 'Quote must be at least 10 characters long',
                                    maxlength: '300',
                                    maxlength_error: 'Quote cannot be longer than 300 characters',
                                    name: 'QuoteText',
                                    rows: '10',
                                    cols: '50'
                                }),
                                t(quote.quoteText)
                            ),
                        ),
                        div(
                            p(
                                t('How many seconds into the video did Northernlion say the quote?')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    required: 'true',
                                    required_error: 'Please enter when the quote happened in the video',
                                    type: 'number',
                                    value: quote.at,
                                    name: 'At'
                                })
                            ),
                        ),
                        div(
                            formButton(
                                t('Update Quote')
                            )
                        )
                    )
                ),
                Hr(),
                Div(
                    h2(
                        t('Delete quote')
                    ),
                    p(
                        button(
                            t('Click here to permanently delete this quote'),
                            event('click', e => navigate(this.link.deleteQuote(this.quoteId), e))
                        )
                    )
                )
            ])
        });
    },

    deleteQuote: function () {
        getUser().then(user => {
            if (user) {
                const headers = new Headers();
                headers.append('Authorization', `${user.token_type} ${user.access_token}`);
                fetch(`/Api/Quotes/${this.quoteId.toString(10)}`, { method: 'DELETE', headers: headers }).then(response => {
                    if (response.ok) {
                        navigate(this.link.editQuote(this.quoteId), undefined, undefined, false, true, true);
                    } else {
                        response.text().then(text => {
                            modal(false, modalContent(text));
                        });
                    }
                })
            }
        });
    }
};


function registerEditQuotePage() {
    registerPage(EditQuotePage, 'Edit Quote', ['EditQuote', '{QuoteId}'])
}


export {
    EditQuotePage,
    registerEditQuotePage
}