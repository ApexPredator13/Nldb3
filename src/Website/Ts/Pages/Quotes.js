import { Html, Div, H1, t, id, Hr, input, attr, P, button, cl, div, img, src, p, br, span, event, style, hr, do_nothing } from "../Framework/renderer"
import { registerPage, initRouter, navigate } from "../Framework/router";
import { get, post } from "../Framework/http";
import { getUser } from "../Framework/Customizable/authentication";
import { Link } from "./_link-creator";
import { QuoteCreator } from "../Components/Quote/quote-creator";

/**
 * the quotes page
 * @constructor
 */
function QuotesPage() {

    /** @type {number|null} */
    this.timeout = null;

    /** @type {boolean} */
    this.canVote = true;

    /** @type {Link} */
    this.link = new Link();

    /** @type {QuoteCreator} */
    this.quoteCreator = new QuoteCreator();
}


QuotesPage.prototype = {
    renderPage: function () {
        new Html([
            H1(
                t('Recently Submitted')
            ),
            hr(),
            Div(
                id('manage-quotes')
            ),
            Div(
                id('recent')
            ),
            Hr(),
            H1(
                t('Random Quotes')
            ),
            P(
                button(
                    t('Reload quotes'),
                    event('click', () => this.loadRandomQuotes())
                )
            ),
            Div(
                id('random')
            ),
            Hr(),
            H1(
                id('search-results-header'),
                t('Search')
            ),
            Div(
                input(
                    attr({
                        type: 'text',
                        placeholder: 'search...'
                    }),
                    event('input', e => this.searchQuotes(e))
                )
            ),
            Div(
                id('search-results')
            ),
            Div(
                style('width: 100%; height: 500px;')
            )
        ]);

        this.loadRandomQuotes();
        this.loadRecentQuotes();
        this.loadUserLoggedInSection();
    },


    searchQuotes: function (e) {

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        setTimeout(function () {
            const searchText = e.target.value;

            if (searchText.length >= 3) {
                get(`/Api/Quotes/search/?text=${searchText}`).then(quotes => {
                    if (!quotes || quotes.length === 0) {
                        new Html([
                            P(t('No quotes found containing "' + searchText + '"'))
                        ], 'search-results');
                    } else {
                        document.getElementById('search-results-header').innerText = 'Search (' + quotes.length + ' results)';
                        new Html([
                            Div(
                                ...quotes.map(quote => div(id(`q${quote.id}`), cl('display-inline'), this.quoteCreator.createSingleQuote(quote)))
                            )
                        ], 'search-results');
                    }
                });
            } else if (searchText.length === 0) {
                document.getElementById('search-results-header').innerText = 'Search';
                new Html([], 'search-results');
            }
        }.bind(this), 1000);
    },

    loadRandomQuotes: function () {
        get('/Api/Quotes/random/10').then(quotes => {
            new Html([
                Div(
                    ...quotes.map(quote => div(id(`q${quote.id}`), cl('display-inline'), this.quoteCreator.createSingleQuote(quote)))
                )
            ], 'random');
        });
    },


    loadUserLoggedInSection: function () {
        getUser().then(user => {
            if (user) {
                new Html([
                    Div(
                        button(
                            t('Manage my submitted quotes'),
                            event('click', e => navigate(this.link.manageMyQuotes(), e))
                        )
                    )
                ], 'manage-quotes')
            }
        })
    },


    loadRecentQuotes: function () {
        get('/Api/Quotes/recent/10').then(quotes => {
            new Html([
                Div(
                    ...quotes.map(quote => div(id(`q${quote.id}`), cl('display-inline'), this.quoteCreator.createSingleQuote(quote)))
                )
            ], 'recent');
        })
    }
}


function registerQuotesPage() {
    registerPage(QuotesPage, 'Quotes', ['Quotes']);
}


export {
    registerQuotesPage,
    QuotesPage
}

(() => { registerQuotesPage(); initRouter(); })();


