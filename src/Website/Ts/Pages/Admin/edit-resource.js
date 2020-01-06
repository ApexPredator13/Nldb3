import { Html, Div, h2, t, event, attr, h1, p, span, input, hr, form, label, div, cl, formButton, br, style, select, strong, option, href, id, a } from "../../Framework/renderer";
import { registerPage, navigate } from "../../Framework/router";
import { get, postResponse } from "../../Framework/http";
import { AdminLink } from "./_admin-link-creator";
import { isaacImage } from "../../Components/General/isaac-image";
import { convertExistsInToString, convertTagToString, convertGameModeToString } from "../../Enums/enum-to-string-converters";
import { existsInOptionlist, tagsAsIsaacResources, gameModeOptionList } from "../../Components/Admin/option-lists";
import { backToResources, nextResource, backToAdminOverview } from "../../Components/Admin/go-back-links";
import { saveToLocalStorage, getFromLocalStorage } from "../../Framework/browser";
import { Searchbox } from "../../Components/General/Searchbox";
import { FormHelper } from "../../Framework/forms";


/**
 * edits an entire isaac resource on a single page
 * @constructor
 * @param {string[]} parameters - route parameters. parameters[0] is the resource ID
 */
function EditResourcePage(parameters) {
    this.resourceId = parameters[0];
    this.localStorageStayKey = 'adminStay';
    this.formHelper = new FormHelper();
    this.link = new AdminLink();
    this.resourceType = 6;
}


EditResourcePage.prototype = {

    /** renders initial dummy content */
    renderPage: function () {
        new Html([
            Div(
                h2(
                    t('loading resource...')
                )
            )
        ]);

        this.loadAndDisplayPage();
    },


    loadAndDisplayPage: function () {
        Promise.all([
            get('/api/mods'),
            get(`/api/Resources/${this.resourceId}/?includeMod=true`)]
        ).then(([mods, resource]) => {

            this.resourceType = resource.resource_type;

            new Html([
                Div(
                    h1(
                        t(`Editing: ${resource.name}`)
                    ),
                    p(
                        t('Stay on this page after saving changes?'),
                        input(
                            this.stayOnPage() ? attr({
                                type: 'checkbox',
                                checked: 'true'
                            }) : attr({
                                type: 'checkbox'
                            }),
                            event('input', e => this.saveStayOnPage(e.target.checked))
                        )
                    ),
                    hr(),


                    // change name
                    h2(
                        t('Change Name')
                    ),
                    form(
                        attr({ method: 'post' }),
                        event('submit', e => this.formHelper.handleSubmit(e, '/Admin/change_resource_name', true, this.nextPageLink(), true, true, true)),
                        input(
                            attr({
                                type: 'hidden',
                                name: 'ResourceId',
                                value: resource.id
                            })
                        ),

                        div(
                            cl('fc'),
                            input(
                                attr({
                                    type: 'text',
                                    name: 'NewName',
                                    value: resource.name,
                                    required: 'true',
                                    requiredError: 'Please enter a new name',
                                    maxlength: '100',
                                    maxlengthError: 'Max length = 100 characters'
                                }),
                                event('input', e => this.formHelper.validateForm(e))
                            )
                        ),

                        div(
                            formButton(
                                t('Change Name')
                            )
                        )
                    ),
                    hr(),


                    // change tags
                    h2(
                        t('Edit Tags')
                    ),
                    p(
                        id('selected-tags'),
                        t('Selected Tags:'),
                        br(),
                        ...(resource.tags && resource.tags.length > 0 ? resource.tags.map(tag => span(
                            t(convertTagToString(tag)),
                            attr({
                                class: 'selected-tag',
                                c: tag.toString(10)
                            }),
                            event('click', e => this.removeTag(e))
                        )) : [span(
                            t('no tags.')
                        )])
                    ),
                    div(
                        id('tags-searchbox-goes-here')
                    ),
                    hr(),


                    // change icon
                    h2(
                        t('Change Icon')
                    ),
                    div(
                        p(
                            t('Current Icon:')
                        ),
                        div(
                            style('background-color: rgba(255,255,255,0.2); display: inline-block; padding: 1rem; border-radius: 1rem;'),
                            isaacImage(resource, undefined, false),
                            isaacImage(resource, undefined, true)
                        )
                    ),
                    form(
                        attr({
                            method: 'post',
                            enctype: 'multipart/form-data'
                        }),
                        event('submit', e => this.formHelper.handleSubmit(e, '/Admin/change_icon', true, this.nextPageLink(), true, true, true)),

                        input(
                            attr({
                                type: 'hidden',
                                name: 'ResourceId',
                                value: resource.id
                            })
                        ),

                        div(
                            label(
                                t('Change Icon')
                            ),
                            br(),
                            input(
                                attr({
                                    type: 'file',
                                    name: 'NewIcon',
                                    required: 'true',
                                    requiredError: 'A new icon must be selected',
                                }),
                                event('change', e => this.formHelper.validateForm(e))
                            )
                        ),
                        div(
                            formButton(
                                t('Submit new Icon')
                            )
                        )
                    ),
                    hr(),


                    // existance
                    h2(
                        t('Existance')
                    ),
                    p(
                        t('This resource currently exists in:'),
                        br(),
                        span(
                            cl('orange'),
                            t(convertExistsInToString(resource.exists_in))
                        )
                    ),
                    form(
                        attr({ method: 'post' }),
                        event('submit', e => this.formHelper.handleSubmit(e, '/Admin/change_exists_in', true, this.nextPageLink(), true, true, true)),
                        input(
                            attr({
                                type: 'hidden',
                                name: 'ResourceId',
                                value: resource.id
                            })
                        ),

                        div(
                            label(
                                t('Change Existance')
                            ),
                            select(
                                attr({
                                    required: 'true',
                                    requiredError: 'please select an option',
                                    name: 'NewExistsIn'
                                }),
                                event('input', e => this.formHelper.validateForm(e)),
                                ...existsInOptionlist(resource.exists_in)
                            )
                        ),
                        div(
                            formButton(
                                t('Change Existance')
                            )
                        )
                    ),
                    hr(),


                    // update mod
                    h2(
                        t('Update Mod')
                    ),
                    p(
                        resource.mod ? span(
                            t('This resource is from a mod: '),
                            strong(
                                cl('orange'),
                                t(resource.mod.name)
                            )
                        ) : span(
                            t('This resource does not belong to a mod')
                        )
                    ),
                    form(
                        attr({ method: 'post' }),
                        event('submit', e => this.formHelper.handleSubmit(e, '/Admin/change_mod', true, this.nextPageLink(), true, true, true)),
                        input(
                            attr({
                                type: 'hidden',
                                name: 'ResourceId',
                                value: resource.id
                            })
                        ),

                        div(
                            select(
                                attr({
                                    name: 'ModId',
                                    required: 'true',
                                    requiredError: 'Please select a mod'
                                }),
                                event('change', e => this.formHelper.validateForm(e)),

                                option('No Mod', '', resource.mod ? false : true),
                                ...mods.map(mod => option(mod.name, mod.id.toString(10), resource.mod && resource.mod.id === mod.id))
                            )
                        ),
                        div(
                            formButton(
                                t('Change Mod')
                            )
                        )
                    ),
                    hr(),


                    // update color
                    h2(
                        t('Change Color')
                    ),
                    p(
                        strong(
                            style(`color: ${resource.color ? resource.color : 'white'}`),
                            t('This is the current color!')
                        )
                    ),
                    form(
                        attr({ method: 'post' }),
                        event('submit', e => this.formHelper.handleSubmit(e, '/Admin/change_color', true, this.nextPageLink(), true, true, true)),
                        input(
                            attr({
                                type: 'hidden',
                                name: 'ResourceId',
                                value: resource.id
                            })
                        ),

                        div(
                            label(
                                t('New Color: ')
                            ),
                            input(
                                attr({
                                    type: 'text',
                                    name: 'Color',
                                    required: 'true',
                                    requiredError: 'Please selecte a color',
                                    minlength: '2',
                                    minlengthError: 'Invalid color',
                                    value: '#'
                                })
                            )
                        ),
                        div(
                            formButton(
                                t('Save New Color')
                            )
                        )
                    ),
                    hr(),


                    // display order
                    h2(
                        t('Display Order')
                    ),
                    form(
                        attr({ method: 'post' }),
                        event('submit', e => this.formHelper.handleSubmit(e, '/Admin/change_display_order', true, this.nextPageLink(), true, true, true)),
                        input(
                            attr({
                                type: 'hidden',
                                name: 'ResourceId',
                                value: resource.id
                            })
                        ),

                        div(
                            label(
                                t('Leaving order empty will set it to NULL')
                            ),
                            br(),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    name: 'DisplayOrder',
                                    value: typeof (resource.display_order) === 'number' ? resource.display_order : ''
                                })
                            )
                        ),
                        div(
                            formButton(
                                t('Change Order')
                            )
                        )
                    ),
                    hr(),


                    // game mode
                    h2(
                        t('Game Mode')
                    ),
                    form(
                        attr({ method: 'post' }),
                        event('submit', e => this.formHelper.handleSubmit(e, '/Admin/change_game_mode', true, this.nextPageLink(), true, true, true)),
                        input(
                            attr({
                                type: 'hidden',
                                name: 'ResourceId',
                                value: resource.id
                            })
                        ),

                        div(
                            label(
                                t(`Current game mode is: ${typeof (resource.game_mode) === 'number' ? convertGameModeToString(resource.game_mode) : 'not set yet'}`)
                            ),
                            br(),
                            select(
                                attr({
                                    name: 'NewGameMode',
                                    required: 'true',
                                    requiredError: 'Please select a game mode'
                                }),
                                event('change', e => this.formHelper.validateForm(e)),

                                ...gameModeOptionList()
                            )
                        ),
                        div(
                            formButton(
                                t('Change Game Mode')
                            )
                        )
                    ),
                    hr(),

                    nextResource(this.resourceType, this.resourceId),
                    backToResources(this.resourceType),

                    div(
                        p(
                            a(
                                href(this.link.deleteResource(this.resourceType, this.resourceId)),
                                t('Delete Link'),
                                event('click', e => navigate(this.link.deleteResource(this.resourceType, this.resourceId), e))
                            )
                        )
                    ),

                    backToAdminOverview()
                )
            ]);

            new Searchbox(this, this.addTag, 1, tagsAsIsaacResources(), false, 'tags-searchbox-goes-here');
        });
    },


    /**
     * removes a tag from a resource
     * @param {Event} e - the raw click event
     */
    removeTag: function (e) {
        const tagToRemove = parseInt(e.target.getAttribute('c'), 10);
        const existingTags = this.getExistingTags();
        const newTags = existingTags.filter(existingTag => existingTag !== tagToRemove);
        const body = {
            ResourceId: this.resourceId,
            Tags: newTags
        };
        postResponse('/Admin/change_tags', JSON.stringify(body), true).then(response => {
            if (response.ok) {
                navigate(this.nextPageLink(), e, undefined, true, true, true);
            }
        });
    },


    /**
     * adds a tag - tag must be a stringified number - like '233'.
     * @param {string} tagAsString
     */
    addTag: function (tagAsString) {
        const tag = parseInt(tagAsString, 10);
        const existingTags = this.getExistingTags();
        existingTags.push(tag);
        const body = {
            ResourceId: this.resourceId,
            Tags: existingTags
        };
        const link = this.nextPageLink();
        postResponse('/Admin/change_tags', JSON.stringify(body), true).then(response => {
            if (response.ok) {
                navigate(link, undefined, undefined, true, true, true);
            }
        });
    },


    /**
     * returns all tags the resource currently has as number[]
     * @returns {number[]}
     */
    getExistingTags: function () {
        const existingTags = [];
        const spans = document.getElementById('selected-tags').getElementsByTagName('span');
        if (spans && spans.length > 0) {
            for (let i = 0; i < spans.length; ++i) {
                const tag = parseInt(spans[i].getAttribute('c'), 10);
                if (!isNaN(tag)) {
                    existingTags.push(tag);
                }
            }
        }
        return existingTags;
    },


    /**
     * saves the 'stay on page?' status to local storage
     * @param {boolean} stay
     */
    saveStayOnPage: function (stay) {
        saveToLocalStorage(this.localStorageStayKey, { stayOnPage: stay })
    },

    /**
     * returns whether the user wants to stay on the page or not after saving changes
     * @returns {boolean}
     */
    stayOnPage: function () {
        const stayState = getFromLocalStorage(this.localStorageStayKey);
        if (stayState && stayState.stayOnPage === true) {
            return true;
        }
        return false;
    },


    /** creates the link the user will be sent to after changing something on the page */
    nextPageLink: function () {
        if (this.stayOnPage()) {
            return this.link.editResource(this.resourceId);
        } else {
            return this.link.resourceOverview(this.resourceType);
        }
    }
}




function registerEditResourcePage() {
    registerPage(EditResourcePage, 'Edit Resource', ['Admin', 'EditResource', '{resourceId}']);
}



export {
    EditResourcePage,
    registerEditResourcePage
}


