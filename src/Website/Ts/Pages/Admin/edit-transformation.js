import { isaacImage } from "../../Components/General/isaac-image";
import { FormHelper } from "../../Framework/forms";
import { a, attr, cl, div, Div, event, fieldset, form, formButton, h1, hr, Html, id, img, input, label, p, P, t, Table, tbody, td, thead, tr } from "../../Framework/renderer";
import { navigate, registerPage } from "../../Framework/router"
import { AdminLink } from "./_admin-link-creator";

function EditTransformationPage(parameters) {
    this.transformationId = parameters[0];
    this.link = new AdminLink();
    this.formHelper = new FormHelper();
}

EditTransformationPage.prototype = {
    renderPage: function() {
        new Html([
            Div(
                h1(
                    t(`Editing ${this.transformationId}`)
                ),
                hr(),
                div(
                    id('transformation')
                ),
                div(
                    id('transformation-items')
                )
            )
        ]);

        this.loadTransformationItems();
    },

    loadTransformationItems: function() {
        fetch(`/Api/Resources/transformation-items/${this.transformationId}`).then(items => items.json()).then(items => {
            console.log(items);
            new Html([
                P(
                    t('Current transformation-related items')
                ),
                Table(
                    thead(
                        tr(
                            td(
                                t('icon')
                            ),
                            td(
                                t('name')
                            ),
                            td(
                                t('counts multiple times')
                            ),
                            td(
                                t('requires title string')
                            ),
                            td(
                                t('valid from')
                            ),
                            td(
                                t('valid until')
                            ),
                            td(
                                t('steps required')
                            ),
                            td()
                        )
                    ),
                    tbody(
                        ...items.map(item => {
                            return tr(
                                td(
                                    isaacImage(item, 1, false)
                                ),
                                td(
                                    t(item.name)
                                ),
                                td(
                                    t(item.countsMultipleTimes ? 'true' : 'false')
                                ),
                                td(
                                    t(item.requiresTitleContent ? item.requiresTitleContent : '')
                                ),
                                td(
                                    t(item.validFrom ? new Date(item.validFrom).toLocaleString() : '')
                                ),
                                td(
                                    t(item.validUntil ? new Date(item.validUntil).toLocaleString() : '')
                                ),
                                td(
                                    a(
                                        t('delete'),
                                        event('click', e => navigate(this.link.deleteTransformationItem(this.transformationId, item.id), e))
                                    )
                                )
                            )
                        })
                    )
                ),
                Div(
                    p(
                        t('Add a new item to the pool:')
                    ),
                    form(
                        attr({
                            method: 'post',
                        }),
                        event('submit', e => this.formHelper.handleSubmit(e, '/Admin/make-transformative', true, this.link.editTransformation(this.transformationId), false, true, true)),
                        input(
                            attr({
                                type: 'hidden',
                                name: 'TransformationId',
                                value: this.transformationId
                            })
                        ),
                        fieldset(
                            div(
                                cl('fc'),
                                label(
                                    t('* Isaac Resource ID')
                                ),
                                input(
                                    attr({
                                        type: 'text',
                                        name: 'ResourceId',
                                        required: 'true'
                                    }),
                                    event('input', e => this.formHelper.validateForm(e))
                                )
                            ),
                            div(
                                cl('fc'),
                                label(
                                    t('* Multiple pickups/uses of the same item allowed?')
                                ),
                                input(
                                    attr({
                                        type: 'checkbox',
                                        name: 'CanCountMultipleTimes',
                                        value: 'false'
                                    }),
                                    event('input', e => {
                                        this.formHelper.validateForm(e)
                                        if (e.target.checked) {
                                            e.target.value = 'true';
                                        } else {
                                            e.target.value = 'false';
                                        }
                                    })
                                )
                            ),
                            div(
                                cl('fc'),
                                label(
                                    t('* Number of Steps required')
                                ),
                                input(
                                    attr({
                                        type: 'number',
                                        value: '3',
                                        name: 'StepsNeeded',
                                        required: 'true'
                                    }),
                                    event('input', e => this.formHelper.validateForm(e))
                                )
                            )
                        ),
                        fieldset(
                            div(
                                cl('fc'),
                                label(
                                    t('Required string in video title')
                                ),
                                input(
                                    attr({
                                        type: 'text',
                                        name: 'RequiresTitleContent'
                                    }),
                                    event('input', e => this.formHelper.validateForm(e))
                                )
                            ),
                            div(
                                cl('fc'),
                                label(
                                    t('Valid from')
                                ),
                                input(
                                    attr({
                                        type: 'datetime-local',
                                        name: 'ValidFrom',
                                        value: '2021-03-31T17:00:00.00'
                                    }),
                                    event('input', e => this.formHelper.validateForm(e))
                                )
                            ),
                            div(
                                cl('fc'),
                                label(
                                    t('Valid until')
                                ),
                                input(
                                    attr({
                                        type: 'datetime-local',
                                        name: 'ValidUntil',
                                        value: '2100-01-01T01:00:00.00'
                                    }),
                                    event('input', e => this.formHelper.validateForm(e))
                                )
                            )
                        ),
                        formButton(
                            t('Add Resource to transformation')
                        )
                    )
                )
            ], 'transformation-items');
        });
    },

    confirmDelete: function(isaacResourceId, event) {
        navigate(this.link.deleteTransformationItem(this.transformationId, isaacResourceId), event);
    }
}

function registerEditTransformationPage() {
    registerPage(EditTransformationPage, 'Edit Transformation', ['Admin', 'EditTransformation', '{id}'])
}


export {
    registerEditTransformationPage,
    EditTransformationPage
}