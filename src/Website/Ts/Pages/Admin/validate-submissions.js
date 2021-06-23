import { get, post } from "../../Framework/http"
import { a, attr, button, div, Div, event, h1, hr, Html, id, P, p, t, table, tbody, td, Tr } from "../../Framework/renderer"
import { navigate, registerPage } from "../../Framework/router"
import { AdminLink } from "./_admin-link-creator";

function ValidateSubmissions() {
    this.counter = 0;
    this.link = new AdminLink();
    this.cancel = false;
}

ValidateSubmissions.prototype = {

    renderPage: function() {
        new Html([
            Div(
                h1(
                    t('Validating episodes for transformation progress correctness')
                ),
                hr(),
                p(
                    a(
                        attr({
                            href: '/'
                        }),
                        t('Start validation'),
                        event('click', e => {
                            e.preventDefault();
                            this.loadEpisodes();
                        })
                    )
                ),
                div(
                    button(
                        t('Cancel'),
                        event('click', e => {
                            e.preventDefault();
                            e.target.setAttribute('disabled', 'true');
                            this.cancel = true;
                        }),
                        attr({
                            disabled: 'true'
                        }),
                        id('cancel-btn')
                    )
                ),
                table(
                    tbody(
                        id('progress')
                    )
                )
            )
        ]);
    },

    loadEpisodes: function() {
        document.getElementById('progress').innerHTML = '';
        document.getElementById('cancel-btn').removeAttribute('disabled');
        this.printProgress('loading submissions...');
        get('/Admin/Submissions/1000/0/true', true, true).then(episodes => {
            this.printProgress('submissions loaded');
            this.validateEpisode(episodes);
        });
    },

    validateEpisode: function(episodes) {
        if (!this.cancel) {
            const episode = episodes[this.counter++];

            if (episode) {
                post(`/Admin/recompile/${episode.video_id}/false`, {}, true).then(result => {
                    if (result && result.length) {
                        for (let i = 0; i < result.length; ++i) {
                            this.printValidationError(result[i], episode.video_id, episode.video_title)
                        }
                    }
                    this.validateEpisode(episodes);
                });
            } else {
                this.printProgress('done');
            }
        }
    },

    printProgress: function(text1) {
        new Html([
            Tr(
                td(
                    t(text1),
                    attr({
                        colspan: '3'
                    })
                )
            )
        ], 'progress', true, false);
    },

    printValidationError: function(validationResult, videoId, videoTitle) {
        new Html([
            Tr(
                td(
                    t(validationResult.message)
                ),
                td(
                    t(videoTitle)
                ),
                td(
                    a(
                        t('fix episode'),
                        attr({
                            href: '/'
                        }),
                        event('click', e =>{ 
                            e.preventDefault(); 
                            post(`/Admin/recompile/${videoId}/true`, {}, true, true).then(() => {
                                navigate(this.link.validateSubmissions(), null, null, false, true, true);
                            })
                        })
                    )
                )
            )
        ], 'progress', true, false)
    }
}

function registerValidateSubmissionsPage() {
    registerPage(ValidateSubmissions, 'Validate Submission Transformation Correctness', ['Admin', 'ValidateSubmissions']);
}

export {
    registerValidateSubmissionsPage,
    ValidateSubmissions
}