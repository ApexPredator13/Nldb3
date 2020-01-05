import { registerPage, navigate } from "../Framework/router";
import { getUser, signin } from "../Framework/Customizable/authentication";
import { Html, H1, t, Hr, P, span, cl, event, br, img, src, Div, div, p } from "../Framework/renderer";
import { User } from "oidc-client";
import { get } from "../Framework/http";
import { createSingleQuote } from "./quotes";
import { Link } from "./_link-creator";
import { QuoteCreator } from "../Components/Quote/quote-creator";


/**
 * Page for managing quotes
 * @constructor
 */
function ManageQuotesPage() {
    this.link = new Link();
    this.quoteCreator = new QuoteCreator();
}


ManageQuotesPage.prototype = {

    /** renders the initial page */
    renderPage: function () {
        new Html([
            H1(
                t('Loading...')
            ),
            Hr()
        ]);

        this.loadUser();
    },


    /** loads the user, displays error if user is not logged in */
    loadUser: function () {
        getUser().then(user => {
            if (user) {
                this.loadQuotes();
            } else {
                new Html([
                    H1(
                        t('You seem to not be logged in')
                    ),
                    Hr(),
                    P(
                        t('Please '),
                        span(
                            t('log yourself in'),
                            cl('orange', 'u', 'hand'),
                            event('click', () => signin())
                        ),
                        t(' before editing')
                    )
                ])
            }
        });
    },


    /**
     * loads and displays quotes
     * @param {User} user
     */
    loadQuotes: function () {
        get('/Api/Quotes/user', true, true).then(quotes => {
            if (!quotes || quotes.length === 0) {
                new Html([
                    H1(
                        t('You didn\'t submit any quotes yet.')
                    ),
                    Hr(),
                    P(
                        t('Quotes can be submitted while watching an episode on this page.'),
                        br(),
                        t('Click the \'Submit\' button on any page that displays videos to begin!'),
                        br(),
                        br(),
                        img(
                            src('/img/submit.png')
                        )
                    )
                ])
            } else {
                new Html([
                    H1(
                        t('Your submitted quotes')
                    ),
                    P(
                        t('Click "Edit" to change data about individual quotes.')
                    ),
                    Hr(),
                    Div(
                        ...quotes.map(quote => this.quoteCreator.createSingleQuote(quote, true))
                    )
                ]);
            }
        });
    }
};

function registerManageQuotesPage() {
    registerPage(ManageQuotesPage, 'Manage Quotes', ['ManageQuotes']);
}


export {
    ManageQuotesPage,
    registerManageQuotesPage
}

