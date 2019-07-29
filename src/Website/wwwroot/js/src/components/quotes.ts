import { Quote } from "../interfaces/quote";
import { removeClassIfExists, addClassIfNotExists } from "../lib/dom-operations";

interface InitializeQuotes {
    videoId?: string
    random?: { amount: number }
    recent?: { amount: number }
    search?: string
}

class QuotesComponent {

    private element: HTMLDivElement;
    private options: InitializeQuotes;

    constructor(elementId: string, options: InitializeQuotes) {
        this.options = options;
        const element = document.getElementById(elementId);
        if (element && element instanceof HTMLDivElement) {
            this.element = element;
        } else {
            console.error(options);
            throw `no element '${elementId}' found that can be used for quotes`;
        }

        this.loadQuotes(options).catch(() => console.warn('initial fetching of quotes was rejected'));
    }

    public reloadQuotes(): Promise<void> {
        return this.loadQuotes(this.options);
    }

    public changeAmount(newAmount: number): void {
        if (this.options.random) {
            this.options.random.amount = newAmount;
        } else if (this.options.recent) {
            this.options.recent.amount = newAmount;
        }
    }

    public changeSearch(text: string): void {
        this.options.search = text;
    }

    private loadQuotes(options: InitializeQuotes): Promise<void> {
        let response: Promise<Response> | undefined;
        if (options.videoId !== undefined) {
            response = fetch(`/api/quotes/${options.videoId}`);
        } else if (options.random) {
            response = fetch(`/api/quotes/random/${options.random.amount}`);
        } else if (options.recent) {
            response = fetch(`/api/quotes/recent/${options.recent.amount}`);
        } else if (options.search && options.search.length > 2) {
            response = fetch(`/api/quotes/search/?text=${options.search}`);
        }

        return this.processApiQuoteResponse(response);
    }

    private processApiQuoteResponse(response: Promise<Response> | undefined): Promise<void> {
        if (response) {
            return response
                .then(x => x.json())
                .then((quotes: Array<Quote>) => this.showQuotesOnPage(quotes))
                .catch(() => Promise.reject());
        } else {
            return Promise.reject();
        }
    }

    private showQuotesOnPage(quotes: Array<Quote>): Promise<void> {
        if (quotes.length === 0) {
            this.element.innerHTML = '<p>No quotes found</p>';
        } else {
            this.element.innerHTML = '';
            for (let i = 0; i < quotes.length; i++) {
                const wrapper = document.createElement('div');
                const speechbubble = document.createElement('div');
                const headImage = document.createElement('img');
                const footer = document.createElement('div');
                const footerName = document.createElement('span');
                const footerBreak = document.createElement('br');
                const footerWatch = document.createElement('a');
                const footerSeperator = document.createElement('span');
                const footerUpvote = document.createElement('span');
                const footerDownvote = document.createElement('span');

                speechbubble.classList.add('speechbubble');
                speechbubble.innerText = quotes[i].quoteText;

                headImage.src = '/img/nlhead.png';

                footerName.innerText = `By ${quotes[i].contributor}`;

                footerWatch.innerText = "Watch on Youtube";
                footerWatch.target = "_blank";
                footerWatch.href = `https://www.youtube.com/watch?v=${quotes[i].videoId}&t=${quotes[i].at.toString(10)}s`;

                footerSeperator.innerText = " | ";

                footerUpvote.innerText = "🡅";
                footerUpvote.classList.add('hand');
                if (quotes[i].vote !== undefined && quotes[i].vote === 1) {
                    footerUpvote.classList.add('green')
                }
                footerUpvote.addEventListener('click', () => {
                    const requestData = {
                        vote: 1,
                        quoteId: quotes[i].id,
                    };
                    fetch('/api/quotes/vote', { method: 'POST', body: JSON.stringify(requestData), headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }).then(x => {
                        if (x.ok) {
                            removeClassIfExists(footerDownvote, 'red');
                            addClassIfNotExists(footerUpvote, 'green');
                        }
                    });
                });

                footerDownvote.innerText = "🡇";
                footerDownvote.classList.add('hand');
                if (quotes[i].vote !== undefined && quotes[i].vote === 0) {
                    footerDownvote.classList.add('red');
                }
                footerDownvote.addEventListener('click', () => {
                    const requestData = {
                        vote: 0,
                        quoteId: quotes[i].id,
                    };
                    fetch('/api/quotes/vote', { method: 'POST', body: JSON.stringify(requestData), headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }).then(x => {
                        if (x.ok) {
                            addClassIfNotExists(footerDownvote, 'red');
                            removeClassIfExists(footerUpvote, 'green');
                        }
                    });
                });

                footer.classList.add('quote-footer');
                footer.appendChild(footerName);
                footer.appendChild(footerBreak);
                footer.appendChild(footerWatch);
                footer.appendChild(footerSeperator);
                footer.appendChild(footerUpvote);
                footer.appendChild(footerDownvote);

                wrapper.classList.add('quote');
                wrapper.appendChild(speechbubble);
                wrapper.appendChild(headImage);
                wrapper.appendChild(footer);
                this.element.appendChild(wrapper);
            }
        }
        return Promise.resolve();
    }
}

export {
    InitializeQuotes,
    QuotesComponent
}


