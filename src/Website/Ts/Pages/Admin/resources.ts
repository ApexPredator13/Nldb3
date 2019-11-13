import { Component, FrameworkElement, AsyncComponentPart, A } from "../../Framework/renderer";
import { PageData, registerPage, getPageData } from "../../Framework/router";
import { ResourceType } from "../../../wwwroot/js/src/enums/resource-type";
import { get } from "../../Framework/http";
import { IsaacResource } from "../../../wwwroot/js/src/interfaces/isaac-resource";

export class Resources implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>

    private resourceType = ResourceType.Item;

    constructor() {
        const data = getPageData<ResourceType>();
        if (typeof(data) === 'number') {
            this.resourceType = data;
        }

        this.E = {
            e: ['div', 'loading resources...'],
            a: [[A.Id, 'id']]
        }

        this.A = this.LoadResources();
    }

    private LoadResources(): Array<AsyncComponentPart> {
        const part: AsyncComponentPart = {
            I: 'id',
            P: get<Array<IsaacResource>>(`/Api/Resources/?ResourceType=${this.resourceType.toString(10)}`).then(resources => {
                console.log(resources);
                const result: FrameworkElement = {
                    e: ['div']
                };
                return result;
            })
        }

        return [part];
    }





    static RegisterPage() {
        const pageData: PageData = {
            AppendTo: 'main-container',
            Component: Resources,
            Data: ResourceType.Item,
            Title: 'Resources',
            Urls: ['/Admin/Resources']
        };
        registerPage('resources', pageData);
    }
}


