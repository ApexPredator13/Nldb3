import { registerPage, initRouter } from '../Framework/router';
import { Html, H1, t, Hr, Div, button, event, P, br, cl, h4 } from '../Framework/renderer';
import { get } from '../Framework/http';

function RandomEpisodeGeneratorPage() { }

RandomEpisodeGeneratorPage.prototype = {
    renderPage: function() {
        new Html([
            H1(
                t('Random Episode Genarator')
            ),
            P(
                t('Watch a random episode from...')
            ),
            Hr(),
            Div(
                button(
                    t('All Versions'),
                    cl('btn-rng'),
                    event('click', e => this.getEpisode('all', e))
                )
            ),
            Div(
                h4(
                    t('Flash Versions'),
                    br(),
                    button(
                        t('Vanilla'),
                        event('click', e => this.getEpisode('vanilla', e)),
                        cl('btn-rng')
                    ),
                    br(),
                    button(
                        t('Wrath of the Lamb'),
                        event('click', e => this.getEpisode('wotl', e)),
                        cl('btn-rng')
                    ),
                ),
                
                h4(
                    t('Newer Versions'),
                    br(),
                    button(
                        t('Rebirth'),
                        event('click', e => this.getEpisode('rebirth', e)),
                        cl('btn-rng')
                    ),
                    br(),
                    button(
                        t('Afterbirth'),
                        event('click', e => this.getEpisode('afterbirth', e)),
                        cl('btn-rng')
                    ),
                    br(),
                    button(
                        t('Afterbirth Plus'),
                        event('click', e => this.getEpisode('afterbirthplus', e)),
                        cl('btn-rng')
                    )
                ),
                h4(
                    t('Modded Versions'),
                    br(),
                    button(
                        t('Community Remix'),
                        event('click', e => this.getEpisode('communityremix', e)),
                        cl('btn-rng')
                    ),
                    br(),
                    button(
                        t('Antibirth'),
                        event('click', e => this.getEpisode('antibirth', e)),
                        cl('btn-rng')
                    )
                )
            )
        ])
    },

    getEpisode: function(type, event) {
        event.preventDefault();
        fetch(`/RandomEpisode/${type}`)
            .then(response => response.text())
            .then(id => window.open(`https://www.youtube.com/watch?v=${id}`, '_blank'));
    }
};

function registerRandomEpisodeGeneratorPage() {
    registerPage(RandomEpisodeGeneratorPage, 'Random Episode Generator', ['RandomEpisodeGenerator']);
}

export {
    RandomEpisodeGeneratorPage,
    registerRandomEpisodeGeneratorPage
}

(() => {
    registerRandomEpisodeGeneratorPage();
    initRouter();
})();


