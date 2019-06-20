import { ComponentType } from "../enums/component-type";

export class PrerenderedComponent {

    private static pageComponents = new Map<ComponentType, Map<string, HTMLDivElement>>();

    constructor(componentType: ComponentType, prerenderedComponentId: string) {
        if (!PrerenderedComponent.pageComponents.has(componentType)) {
            PrerenderedComponent.pageComponents.set(componentType, new Map<string, HTMLDivElement>());
        }

        const componentMap = PrerenderedComponent.pageComponents.get(componentType);
        const prerenderedComponentElement = document.getElementById(prerenderedComponentId) as HTMLDivElement;

        if (componentMap && prerenderedComponentElement) {
            componentMap.set(prerenderedComponentId, prerenderedComponentElement);
        }
    }

    GetComponent(componentType: ComponentType, prerenderedComponentId: string): HTMLDivElement {
        const componentMap = PrerenderedComponent.pageComponents.get(componentType);
        if (!componentMap) {
            throw "no component of this type was registered yet!";
        }

        const component = componentMap.get(prerenderedComponentId);
        if (!component) {
            throw `no component with ID ${prerenderedComponentId} exists!`;
        }

        return component;
    }
}

