import { Component, FrameworkElement, AsyncComponentPart, A } from "../../Framework/renderer";
import { PageData, registerPage } from "../../Framework/router";
import { get } from "../../Framework/http";
import { IsaacResource } from "../../Models/isaac-resource";
import { ResourceType } from "../../Enums/resource-type";

export class ResourcesPage implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>

    private resourceType = ResourceType.Item;

    constructor(parameters: Array<string>) {
        this.resourceType = Number(parameters[0]) as ResourceType;

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
        const page: PageData = {
            Component: ResourcesPage,
            Title: 'Resources',
            Url: ['Admin', 'Resources', '{type}']
        };
        registerPage(page);
    }
}


