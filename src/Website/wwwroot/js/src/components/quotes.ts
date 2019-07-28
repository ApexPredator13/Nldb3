import { Quote } from "../interfaces/quote";
import { removeClassIfExists, addClassIfNotExists } from "../lib/dom-operations";

interface InitializeQuotes {
    videoId?: string
    random?: boolean
    amount?: number
}

class QuotesComponent {

    private element: HTMLDivElement;

    constructor(elementId: string, options: InitializeQuotes) {
        const element = document.getElementById(elementId);
        if (element && element instanceof HTMLDivElement) {
            this.element = element;
        } else {
            throw "no element found that can be used for quotes";
        }

        this.loadQuotes(options);
    }

    loadQuotes(options: InitializeQuotes): void {
        if (options.videoId !== undefined) {
            fetch(`/api/quotes/${options.videoId}`).then(x => x.json()).then((quotes: Array<Quote>) => {
                console.log(quotes);
                this.showQuotes(quotes);
            });
        }
    }

    showQuotes(quotes: Array<Quote>): void {
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

            footerName.innerText = quotes[i].contributor;

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
                fetch('/api/quotes/vote', { method: 'POST', body: JSON.stringify(requestData), headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }}).then(x => {
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
}

export {
    InitializeQuotes,
    QuotesComponent
}


