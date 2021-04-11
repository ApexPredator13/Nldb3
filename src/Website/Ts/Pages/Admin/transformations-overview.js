import { a, div, Div, h1, hr, Html, id, p, t, table, tbody, td, th, thead, tr } from "../../Framework/renderer"
import { navigate, registerPage } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";

/**
 * page that lists all transformations
 * @constructor
 */
function TransformationsOverview() {
    this.link = new AdminLink();
}

TransformationsOverview.prototype = {

    /** renders the page */
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t('What transformation should be changed?')
                ),
                hr(),
                div(
                    p('loading transformations...'),
                    id('transformations')
                )
            )
        ]);

        this.loadTransformations();
    },

    /** loads all currently available transformations from the API endpoint and displays them in a list */
    loadTransformations: function () {
        fetch('/Api/Resources/?ResourceType=12').then(function (r) {
            return r.json()
        }).then(function (r) {
            new Html([
                table(
                    thead(
                        tr(
                            th(t('transformation name')),
                            th()
                        )
                    ),
                    tbody(
                        tr(
                            td(t(r.name)),
                            td(
                                a(
                                    t('Edit'),
                                    event('click', e => navigate(this.link.editTransformation(e.name), e))
                                )
                            )
                        )
                    )
                )
            ], 'transformations', true, true)
        })
    },

    navigateToTransformationPage: function (id) {
        navigate()
    }
}


function registerTransformationsOverviewPage() {
    registerPage(TransformationsOverview, 'Transformations Overview', ['Admin', 'TransformationsOverview'])
}

export {
    TransformationsOverview,
    registerTransformationsOverviewPage
}