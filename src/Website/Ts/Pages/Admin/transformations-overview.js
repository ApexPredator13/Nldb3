import { a, cl, div, Div, event, h1, hr, Html, id, p, t, Table, table, tbody, td, th, thead, tr } from "../../Framework/renderer"
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
                    p(t('loading transformations...')),
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
        }).then(function (transformations) {
            new Html([
                Table(
                    thead(
                        tr(
                            th(t('transformation name')),
                            th()
                        )
                    ),
                    tbody(
                        ...transformations.map(function(transformation) {
                            let link = new AdminLink();
                            return tr(
                                td(
                                    t(transformation.name)
                                ),
                                td(
                                    t('edit'),
                                    event('click', e => navigate(link.editTransformation(transformation.id), e)),
                                    cl('hand')
                                )
                            )
                        })
                    )
                )
            ], 'transformations', true, true)
        })
    },

    navigateToTransformationPage: function (id) {
        navigate(this.link.editTransformation());
    }
}


function registerTransformationsOverviewPage() {
    registerPage(TransformationsOverview, 'Transformations Overview', ['Admin', 'TransformationsOverview']);
}

export {
    TransformationsOverview,
    registerTransformationsOverviewPage
}