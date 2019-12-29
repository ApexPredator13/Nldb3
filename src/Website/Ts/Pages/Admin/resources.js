import { Render, Div, thead, tbody, tr, td, t, event, h1, hr, p, span, cl, select, id, th, style } from "../../Framework/renderer";
import { registerPage, navigate } from "../../Framework/router";
import { get } from "../../Framework/http";
import { AdminLink } from "./_admin-link-creator";
import { convertGameModeToString, convertExistsInToString, convertTagToString } from "../../Enums/enum-to-string-converters";
import { saveToLocalStorage } from "../../Framework/browser";
import { isaacImage } from "../../Components/General/isaac-image";
import { resourceTypeOptionList } from "../../Components/Admin/option-lists";



/**
 * the resource overview page
 * @param {string[]} parameters - route parameters. parameters[0] = resource type as number
 */
function ResourcesPage(parameters) {
    this.resourceType = parseInt(parameters[0], 10);
    this.link = new AdminLink();
    this.resourcesContainerId = 'resources';
}


ResourcesPage.prototype = {

    /** renders the initial page */
    renderPage: function () {
        new Render([
            Div(
                h1(
                    t('Resource Overview')
                ),
                hr(),
                p(
                    span(
                        t('Create a new resource'),
                        cl('u', 'hand'),
                        event('click', e => navigate(this.link.createNewResource(), e))
                    )
                ),
                hr(),
                select(
                    event('input', e => {
                        this.resourceType = parseInt(e.target.value);
                        saveToLocalStorage('last_selected_resource_type', this.resourceType);
                        this.loadAndDisplayResources();
                    }),
                    ...resourceTypeOptionList(this.resourceType)
                ),
                div(
                    id(this.resourcesContainerId),
                    t('loading resources...')
                )
            )
        ]);

        this.loadAndDisplayResources()
    },


    /** loads resources from the server and displays them as table */
    loadAndDisplayResources: function () {
        get(`/Api/Resources/?ResourceType=${this.resourceType.toString(10)}&IncludeMod=true`).then(resources => {
            new Render([
                Table(
                    thead(
                        tr(
                            th(
                                t('Icon')
                            ),
                            th(
                                t('Name')
                            ),
                            th(
                                t('Id')
                            ),
                            th(
                                t('Game Mode')
                            ),
                            th(
                                t('Exists In')
                            ),
                            th(
                                t('Image Coordinates')
                            ),
                            th(
                                t('Color')
                            ),
                            th(
                                t('Mod')
                            ),
                            th(
                                t('Order')
                            ),
                            th(
                                t('Difficulty')
                            ),
                            th(
                                t('Tags')
                            ),
                        )
                    ),
                    tbody(
                        ...resources.map(resource => tr(
                            td(
                                isaacImage(resource, undefined, false)
                            ),
                            td(
                                event('click', e => navigate(this.link.editResource(resource.id), e)),
                                t(resource.name)
                            ),
                            td(
                                t(resource.id.toString(10))
                            ),
                            td(
                                t(typeof (resource.game_mode) === 'number' ? convertGameModeToString(resource.game_mode) : '')
                            ),
                            td(
                                t(typeof (resource.exists_in) === 'number' ? convertExistsInToString(resource.exists_in) : '')
                            ),
                            td(
                                t(`x: ${resource.x}, y: ${resource.y}, w: ${resource.w}, h: ${resource.h}`)
                            ),
                            td(
                                style('color: ' + (resource.color ? resource.color : 'white')),
                                t(resource.color ? resource.color : '')
                            ),
                            td(
                                t(resource.mod ? resource.mod.name : '')
                            ),
                            td(
                                t(typeof (resource.display_order) === 'number' ? resource.display_order.toString(10) : '')
                            ),
                            td(
                                t(typeof (resource.difficulty) === 'number' ? resource.difficulty.toString(10) : '')
                            ),
                            td(
                                t(resource.tags ? resource.tags.map(tag => convertTagToString(tag)).join(', ') : '')
                            )
                        ))
                    )
                )
            ], this.resourcesContainerId);
        });
    }
}



function registerResourcesPage() {
    registerPage(ResourcesPage, 'Resources', ['Admin', 'Resources', '{type}'])
}


export {
    ResourcesPage,
    registerResourcesPage
}


