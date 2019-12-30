import { Html, Div, t, p, form, event, attr, input, formButton, h1, hr, div, cl, label, select, option } from "../../Framework/renderer";
import { existsInOptionlist, gameModeOptionList, resourceTypeOptionList } from "../../Components/Admin/option-lists";
import { get } from "../../Framework/http";
import { registerPage } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { FormHelper } from "../../Framework/forms";


/** 
 * page for creating new isaac resources 
 * @constructor
 */
function CreateIsaacResourcePage() {
    this.formHelper = new FormHelper();
    this.link = new AdminLink();
}


CreateIsaacResourcePage.prototype = {
    renderPage: function () {
        new Html([
            Div(
                t('loading necessary data...')
            )
        ]);
        this.loadInfoAndCreatePage();
    },


    loadInfoAndCreatePage: function () {
        get('/Api/Mods').then(mods => {
            new Html([
                Div(
                    h1(
                        t('Create new Resource')
                    ),
                    hr(),

                    form(
                        attr({
                            enctype: 'multipart/form-data',
                            method: 'post'
                        }),
                        event('submit', e => this.formHelper.handleSubmit(e, '/Admin/create_resource', true, this.link.editResource(document.getElementById('new-resource-id').value))),

                        div(
                            cl('fc'),
                            label(
                                t('ID')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'text',
                                    name: 'Id',
                                    id: 'new-resource-id',
                                    required: 'true',
                                    requiredError: 'Resource ID is required',
                                    maxlength: '30',
                                    maxlengthError: 'Max. 30 characters'
                                })
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Name')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'text',
                                    name: 'Name',
                                    required: 'true',
                                    requiredError: 'Please enter a name!'
                                })
                            ),
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Exists In')
                            ),
                            select(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    name: 'ExistsIn',
                                    required: 'true',
                                    requiredError: 'Please choose existance'
                                }),

                                ...existsInOptionlist(1)
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Icon')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'file',
                                    name: 'Icon',
                                    required: 'true',
                                    requiredError: 'Please specify an Icon!'
                                })
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Game Mode')
                            ),
                            select(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    name: 'GameMode',
                                    required: 'true',
                                    requiredError: 'Please select in which game modes the resource can be found in'
                                }),

                                ...gameModeOptionList(0)
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Color')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'text',
                                    name: 'Color',
                                    value: '#',
                                    required: 'true',
                                    requiredError: 'Please enter a color',
                                    minlength: '2',
                                    minlengthError: 'Please enter a valid color name',
                                })
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Resource Type')
                            ),
                            select(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    name: 'ResourceType',
                                    required: 'true',
                                    requiredError: 'Please enter what type of resource this is'
                                }),

                                ...resourceTypeOptionList(6)
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Mod')
                            ),
                            select(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    name: 'FromMod',
                                }),

                                option('No Mod', '', true),
                                mods.map(mod => option(mod.name, mod.id, false))
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Display Order')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    name: 'DisplayOrder',
                                    value: ''
                                })
                            )
                        ),

                        div(
                            cl('fc'),
                            label(
                                t('Difficulty')
                            ),
                            input(
                                event('input', e => this.formHelper.validateForm(e)),
                                attr({
                                    type: 'number',
                                    name: 'Difficulty',
                                    value: ''
                                })
                            )
                        ),

                        div(
                            p(
                                t('Tags can be added in the next step')
                            )
                        ),
                        div(
                            formButton(
                                t('Save New Resource')
                            )
                        )
                    )
                )
            ]);
        });
    }
};


function registerCreateIsaacResourcePage() {
    registerPage(CreateIsaacResourcePage, 'Create Resource', ['Admin', 'CreateResource']);
}


export {
    CreateIsaacResourcePage,
    registerCreateIsaacResourcePage
}

