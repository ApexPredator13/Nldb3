import { Component, FrameworkElement } from "../Framework/renderer";
import { PageData, registerPage, navigate } from "../Framework/router";

export class Redirect implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        this.E = {
            e: ['div', 'Redirecting...']
        };

        setTimeout(() => {
            navigate(decodeURIComponent(parameters[0]));
        }, 20);
    }

    static RegisterPage() {
        const page: PageData = {
            Component: Redirect,
            Title: '',
            Url: ['Redirect', '{url}']
        }
        registerPage(page);
    }
}

