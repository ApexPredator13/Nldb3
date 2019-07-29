import { QuotesComponent } from './components/quotes';

let currentTimeout: number | undefined;

let randomQuotesComponent: QuotesComponent | undefined;
let recentQuotesComponent: QuotesComponent | undefined;
let searchQuotesComponent: QuotesComponent | undefined;

(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const randomAmountSelection = document.getElementById('random-quotes-amount');
        const recentAmountSelection = document.getElementById('recent-quotes-amount');
        const refreshRandomQuotes = document.getElementById('refresh-random-quotes');
        const searchQuotes = document.getElementById('search-quotes-text');

        randomQuotesComponent = new QuotesComponent('random-quotes', { random: { amount: 10 } });
        recentQuotesComponent = new QuotesComponent('recent-quotes', { recent: { amount: 10 } });
        searchQuotesComponent = new QuotesComponent('search-quotes', { search: '' });

        // random quotes amount changed
        if (randomAmountSelection && randomAmountSelection instanceof HTMLInputElement) {
            randomAmountSelection.addEventListener('input', () => {
                if (randomAmountSelection.value && randomQuotesComponent) {
                    const newAmount = parseInt(randomAmountSelection.value, 10);
                    randomQuotesComponent.changeAmount(newAmount);
                    randomQuotesComponent.reloadQuotes();
                }
            });
        }

        // recent quotes amount changed
        if (recentAmountSelection && recentAmountSelection instanceof HTMLInputElement) {
            recentAmountSelection.addEventListener('input', () => {
                if (recentAmountSelection.value && recentQuotesComponent) {
                    const newAmount = parseInt(recentAmountSelection.value, 10);
                    recentQuotesComponent.changeAmount(newAmount);
                    recentQuotesComponent.reloadQuotes();
                }
            });
        }

        // get more random quotes
        if (refreshRandomQuotes && refreshRandomQuotes instanceof HTMLButtonElement) {
            refreshRandomQuotes.addEventListener('click', e => {
                e.preventDefault();
                if (randomQuotesComponent) {
                    refreshRandomQuotes.disabled = true;
                    randomQuotesComponent.reloadQuotes()
                        .then(() => refreshRandomQuotes.disabled = false)
                        .catch(() => refreshRandomQuotes.disabled = false);
                }
            });
        }

        // search quotes
        if (searchQuotes && searchQuotes instanceof HTMLInputElement) {
            searchQuotes.addEventListener('input', () => {
                // only search if no input for 300 ms
                let newTimeout = setTimeout(() => {
                    if (currentTimeout) {
                        clearTimeout(currentTimeout);
                    }
                    currentTimeout = newTimeout;
                    if (searchQuotes.value && searchQuotes.value.length > 2 && searchQuotesComponent) {
                        searchQuotesComponent.changeSearch(searchQuotes.value);
                        searchQuotesComponent.reloadQuotes()
                    }
                }, 300);
            });
        }
    });
})();

