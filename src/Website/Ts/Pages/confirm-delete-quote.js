import { registerPage, navigate } from "../Framework/router";
import { Html, Div, h1, t, hr, p, div, button, cl, event, id, modal } from "../Framework/renderer";
import { get, createHeaders } from "../Framework/http";
import { QuoteCreator } from "../Components/Quote/quote-creator";
import { Link } from "./_link-creator";
import { disableButton } from "../Framework/browser";
import { modalContent } from "../Framework/Customizable/Layout/modal-content";


/**
 * page for deleting a single quote
 * @constructor
 * @param {string[]} parameters - route parameters. parameters[0] = quote ID
 */
function ConfirmDeleteQuotePage(parameters) {
    this.quoteId = parseInt(parameters[0], 10);
    this.quoteCreator = new QuoteCreator();
    this.link = new Link();
}


ConfirmDeleteQuotePage.prototype = {

    /** shows the initial html */
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t('Loading quote...')
                ),
            )
        ]);
        this.loadAndDisplayConfirmation();
    },


    /** loads the quote, then asks the user if he really wants to delete the quote */
    loadAndDisplayConfirmation: function () {
        get(`/Api/Quotes/single/${this.quoteId.toString(10)}`).then(quote => {
            new Html([
                Div(
                    h1(
                        t('Warning!')
                    ),
                    hr(),
                    p(
                        t('Do you really want to delete this quote?')
                    ),
                    div(
                        this.quoteCreator.createSingleQuote(quote)
                    ),
                    div(
                        button(
                            t('Yes, Delete!!'),
                            cl('btn-red'),
                            event('click', e => {
                                const headers = createHeaders(undefined, true);
                                disableButton(e.target);
                                disableButton(document.getElementById('cancel'));
                                fetch(`/Api/Quotes/${this.quoteId}`, { headers: headers, method: 'DELETE' }).then(response => {
                                    if (response.ok) {
                                        navigate(this.link.manageMyQuotes(), e);
                                    } else {
                                        response.text().then(msg => modal(false, modalContent(msg)))
                                    }
                                });
                            })
                        ),
                        button(
                            t('No, CANCEL'),
                            cl('btn-green'),
                            id('cancel'),
                            event('click', e => navigate(this.link.manageMyQuotes(), e))
                        )
                    )
                )
            ])
        });
    }
}


function registerConfirmDeleteQuotePage() {
    registerPage(ConfirmDeleteQuotePage, 'Really Delete the Quote?', ['DeleteQuote', '{QuoteId}']);
}


export {
    ConfirmDeleteQuotePage,
    registerConfirmDeleteQuotePage
}


