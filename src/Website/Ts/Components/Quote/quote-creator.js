import { do_nothing, div, cl, img, src, t, span, event, attr, br, modal, Div, p, Html } from "../../Framework/renderer";
import { Link } from "../../Pages/_link-creator";
import { getUser } from "../../Framework/Customizable/authentication";
import { notLoggedIn } from "../General/modal-contents";
import { post } from "../../Framework/http";
import { navigate } from "../../Framework/router";


/**
 * function that can create html for individual quotes
 * @constructor
 */
function QuoteCreator() {
    this.link = new Link();
    this.canVote = true;
}

QuoteCreator.prototype = {
    createSingleQuote: function (quote, includeEditLink = false) {
        return div(
            cl('quote', 'c'),
            attr({ edit: includeEditLink ? 'true' : 'false' }),

            div(
                cl('speechbubble'),
                t(quote.quoteText)
            ),
            img(
                src('/img/nlhead.png')
            ),
            p(
                cl('quote-footer'),
                t(`Submitted by ${quote.contributor || '[unknown user]'}`),
                br(),
                span(
                    cl('u', 'hand'),
                    t('Click Here to Watch'),
                    event('click', () => this.watchQuote(quote))
                ),
                t(' | '),
                span(
                    t('⇧'),
                    attr({
                        class: 'hand',
                        title: 'Upvote',
                        style: `color: ${this.getQuoteUpVoteColor(quote)}`
                    }),
                    event('mouseenter', e => this.hoverColor(e, 'green')),
                    event('mouseleave', e => this.restoreInitialQuoteUpvoteColor(e, quote)),
                    event('click', e => this.vote(e, quote, 0))
                ),
                t(' '),
                span(
                    t('⇩'),
                    attr({
                        class: 'hand',
                        title: 'Downvote',
                        style: `color: ${this.getQuoteDownVoteColor(quote)}`
                    }),
                    event('mouseenter', e => this.hoverColor(e, 'red')),
                    event('mouseleave', e => this.restoreInitialQuoteDownvoteColor(e, quote)),
                    event('click', e => this.vote(e, quote, 1))
                ),
                includeEditLink ? br() : do_nothing,
                includeEditLink ? span(
                    t('Edit'),
                    cl('u', 'hand'),
                    event('click', e => navigate(this.link.editQuote(quote.id), e))
                ) : do_nothing
            )
        );
    },


    getQuoteDownVoteColor: function (quote) {
        let color = 'white';
        if (quote.vote === 1) {
            color = 'red';
        }
        return color;
    },

    getQuoteUpVoteColor: function (quote) {
        let color = 'white';
        if (quote.vote === 0) {
            color = 'green';
        }
        return color;
    },

    /**
     * colors text on mouseover
     * @param {Event} e - the raw hover event
     * @param {string} color - the color
     */
    hoverColor: function (e, color) {
        e.target.style.color = color;
    },


    /**
     * restores the initial color of the element, depending on it being up- or downvoted already
     * @param {Event} e - the raw mouseleave event
     * @param {any} quote - the quote
     */
    restoreInitialQuoteUpvoteColor: function (e, quote) {
        if (quote.vote === 0) {
            e.target.style.color = 'green';
        } else {
            e.target.style.color = 'white';
        }
    },

    /**
     * restores the initial color of the element, depending on it being up- or downvoted already
     * @param {Event} e - the raw mouseleave event
     * @param {any} quote - the quote
     */
    restoreInitialQuoteDownvoteColor: function (e, quote) {
        if (quote.vote === 1) {
            e.target.style.color = 'red';
        } else {
            e.target.style.color = 'white';
        }
    },


    /**
     * plays the quote on youtube in a new tab
     * @param {any} quote
     */
    watchQuote: function (quote) {
        window.open(`https://youtu.be/${quote.videoId}?t=${quote.at}`, '_blank');
    },


    vote: function (e, quote, vote) {
        if (!this.canVote) {
            return;
        }

        e.target.style.cursor = 'progress';
        this.canVote = false;

        getUser().then(user => {
            if (user) {
                post('/Api/Quotes/vote', JSON.stringify({ Vote: vote, QuoteId: quote.id }), true, true).then(() => {
                    quote.vote = vote;
                    new Html([Div(this.createSingleQuote(quote))], `q${quote.id}`);
                }).finally(() => this.canVote = true);
            } else {
                this.canVote = true;
                modal(false, notLoggedIn())
                debugger;
                if (e && e.target) {
                    e.target.style.color = 'white';
                    e.target.style.cursor = 'pointer';
                }
            }
        });
    },
};


export {
    QuoteCreator
}
