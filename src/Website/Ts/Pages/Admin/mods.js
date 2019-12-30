import { Html, Div, id, h1, t, hr, p, span, cl, div, Table, thead, tr, th, attr, tbody, td, event } from "../../Framework/renderer";
import { registerPage, navigate } from "../../Framework/router";
import { get } from "../../Framework/http";
import { AdminLink } from "./_admin-link-creator";
import '../../Framework/Customizable/typedefs';

/** 
 * displays mods that exist in the database
 * @constructor
 */
function ModsPage() {
    this.link = new AdminLink();
}


ModsPage.prototype = {

    /** renders the initial layout */
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t('Mods')
                ),
                hr(),
                p(
                    span(
                        t('Create a new mod'),
                        cl('u', 'hand'),
                        event('click', e => navigate(this.link.createMod(), e))
                    )
                ),
                hr(),
                div(
                    id('mods')
                )
            )
        ]);

        this.loadAndDisplayExistingMods('mods');
    },


    /**
     * loads all mods from the server and displays them in a table
     * @param {string} containerId - the ID of the container the table should be rendered into
     */
    loadAndDisplayExistingMods: function (containerId) {
        get('/Api/Mods').then(mods => {
            new Html([
                Table(
                    thead(
                        tr(
                            th(
                                t('Id')
                            ),
                            th(
                                t('Mod Name')
                            ),
                            th(
                                attr({ colspan: '2' })
                            )
                        )
                    ),
                    tbody(
                        ...mods.map(mod => tr(
                            td(
                                t(mod.id.toString(10))
                            ),
                            td(
                                t(mod.name),
                                event('click', e => navigate(this.link.mod(mod.id), e)),
                                cl('u', 'hand')
                            ),
                            td(
                                t(mod.links && mod.links.length > 0 ? `${mod.links.length.toString(10)} links` : '0 links')
                            ),
                            td(
                                span(
                                    t('Delete'),
                                    cl('u', 'hand'),
                                    event('click', e => navigate(this.link.deleteMod(mod.id, mod.name), e))
                                )
                            )
                        ))
                    )
                )
            ], containerId);
        })
    }
}


function registerModsPage() {
    registerPage(ModsPage, 'Mods', ['Admin', 'Mods']);
}


export {
    ModsPage,
    registerModsPage
}