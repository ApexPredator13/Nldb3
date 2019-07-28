import { QuotesComponent } from './components/quotes';

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        new QuotesComponent('quotes', { videoId: window.location.href.substring(window.location.href.length - 11) });
    });
})();


