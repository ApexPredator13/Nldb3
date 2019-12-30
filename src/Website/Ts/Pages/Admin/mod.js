import { Html, Div, t, h1, hr, table, thead, tr, th, tbody, p, span, cl, div, a, attr, td, event } from "../../Framework/renderer";
import { registerPage, navigate } from "../../Framework/router";
import { get } from "../../Framework/http";
import { AdminLink } from "./_admin-link-creator";
import { backToMods, backToAdminOverview } from "../../Components/Admin/go-back-links";


/**
 * mod details page
 * @param {string[]} parameters - route parameters. parameters[0] is the mod ID
 */
function ModPage(parameters) {
    this.modId = parseInt(parameters[0], 10);
    this.link = new AdminLink();
}


ModPage.prototype = {

    /** initial dummy content... */
    renderPage: function () {
        new Html([
            Div(
                t('loading mod...')
            )
        ]);

        this.loadMod();
    },


    /** loads the mod from the server and displays it */
    loadMod: function () {
        get(`/Api/Mods/${this.modId}`).then(mod => {
            new Html([
                Div(
                    h1(
                        t(mod.name)
                    ),
                    hr(),
                    table(
                        thead(
                            tr(
                                th(
                                    t('id')
                                ),
                                th(
                                    t('Name')
                                ),
                                th(
                                    t('# Links')
                                )
                            )
                        ),
                        tbody(
                            tr(
                                td(
                                    t(mod.id.toString(10))
                                ),
                                td(
                                    t(mod.name)
                                ),
                                td(
                                    t(mod.links ? mod.links.length.toString(10) : '0')
                                )
                            )
                        )
                    ),
                    hr(),
                    p(
                        span(
                            t('Add Link'),
                            cl('u', 'hand'),
                            event('click', e => navigate(this.link.createModLink(mod.id), e))
                        )
                    ),
                    mod.links && mod.links.length > 0 ? div(
                        table(
                            ...mod.links.map(link => tr(
                                td(
                                    a(
                                        t(link.link_text),
                                        attr({ href: link.link_text, target: '_blank' })
                                    )
                                ),
                                td(
                                    span(
                                        t('delete'),
                                        cl('u', 'hand'),
                                        event('click', e => navigate(this.link.deleteModLink(link.id, link.link_text, mod.id), e))
                                    )
                                )
                            ))
                        )
                    ) : div(t('No links have been created yet.')),
                    hr(),
                    backToMods(),
                    backToAdminOverview()
                )
            ]);
        });
    }
}


function registerModPage() {
    registerPage(ModPage, 'Mod Overview', ['Admin', 'Mod', '{id}']);
}


export {
    ModPage,
    registerModPage
}


