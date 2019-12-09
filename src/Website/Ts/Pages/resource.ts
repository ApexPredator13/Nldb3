import { Component, FrameworkElement, AsyncComponentPart, A } from "../Framework/renderer";
import { PageData, PageType, registerPage, setGlobalPageType, initRouter } from "../Framework/router";
import { get } from "../Framework/http";
import { StatsPageResult } from "../Models/StatsPageResult";

export class Resource implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    private resourceId: string;

    constructor(parameters: Array<string>) {
        this.resourceId = parameters[0];

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', this.resourceId]
                },
                {
                    e: ['div'],
                    a: [[A.Id, 'page-container']]
                }
            ]
        };

        this.A = this.CreatePage();
    }

    private CreatePage(): Array<AsyncComponentPart> {
        const part: AsyncComponentPart = {
            I: 'page-container',
            P: get<StatsPageResult>(`/Api/Resources/${this.resourceId}/Stats`).then(result => {
                if (!result) {
                    return {
                        e: ['div', 'Resource not found.']
                    };
                }

                return {
                    e: ['div']
                };
            })
        };

        return [part];
    }

    static RegisterPage() {
        const page: PageData = {
            Component: Resource,
            Title: 'Loading resource...',
            Url: ['{ResourceId}'],
            specificPageType: PageType.IsaacResource
        };
        registerPage(page);
    }
}

(() => {
    setGlobalPageType(PageType.IsaacResource);
    Resource.RegisterPage();
    initRouter();
})();

