import { Component, FrameworkElement } from "../../Framework/renderer";
import { get } from "../../Framework/http";
import { PageData, navigate, registerPage } from "../../Framework/router";
import { ResourceType } from "../../Enums/resource-type";
import { AdminLink } from "./_admin-link-creator";
import { IsaacResource } from "../../Models/isaac-resource";

export class RedirectNextResource implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        const resourceType = Number(parameters[0]) as ResourceType;
        const nextResourceId = parameters[1];

        this.E = {
            e: ['div', 'loading next page...']
        }

        get<Array<IsaacResource>>(`/Api/Resources/?ResourceType=${resourceType.toString(10)}`).then(resources => {
            console.log('(redirect) resources loaded.')
            let loadNextResource = false;

            for (let resource of resources) {
                if (loadNextResource) {
                    const link = AdminLink.EditResource(resource.id);
                    console.log('loading next resource: ', link);
                    navigate(link);
                    break;
                }
                if (resource.id === nextResourceId) {
                    console.log('found current resource: ', resource.id);
                    loadNextResource = true;
                }
            }
        });
    }

    static RegisterPage() {
        const data: PageData = {
            Component: RedirectNextResource,
            Title: 'loading next page..',
            Url: ['Admin', 'RedirectNextResource', '{resourceType}', '{nextResourceId}']
        }
        registerPage(data);
    }
}