import { render, Component } from './renderer';
import { NavigationComponent } from '../Pages/Layout/navigation';
import { MainComponent } from '../Pages/Layout/main';
import * as Oidc from 'oidc-client';

interface PageData {
    AppendTo: string,
    Component: new() => Component,
    Title: string | (() => string),
    Url: string
}

const getPages = () => {
    if (!(window as any).pages) {
        (window as any).pages = new Map<string, PageData>();
    }

    const pages = (window as any).pages as Map<string, PageData>;
    return pages;
}

const registerPage = (name: string, data: PageData) => {
    const pages = getPages();
    if (!pages.has(name)) {
        console.info('registering page: ', name);
        pages.set(name, data);
    } else {
        console.info('page already exists: ', name);
    }
}

const initRouter = () => {
    if (!(window as any).routerInit) {

        Oidc.Log.logger = console;

        // render layout
        console.log('rendering navigation');
        const navigation = render(new NavigationComponent());

        console.log('rendering main');
        const main = render(new MainComponent());

        if (main && navigation) {
            document.body.appendChild(navigation);
            document.body.appendChild(main);
        }

        // delay enough so that initial popstate event that some browsers trigger on load will be skipped
        setTimeout(() => {
            window.addEventListener('popstate', () => {
                const url = getCurrentRoute();
                goToRouteWithUrl(url, false, true);
            });
        }, 100);

        // load initial page, only one should exist at the start
        const pages = getPages();
        for (const page of pages) {
            goToRouteWithName(page[0], false, true);
            break;
        }
    }
    (window as any).routerInit = true;
};

const goToRouteWithName = (routeName: string, push = true, forceRender = false, scrollToTop = true) => {
    const pages = getPages();
    for (const page of pages) {
        if (page[0] === routeName) {
            goToRouteWithUrl(page[1].Url, push, forceRender, scrollToTop);
            return;
        }
    }
}

const getRouteNameFromUrl = (route: string): string | null => {
    const pages = getPages();
    for (const page of pages) {
        if (page[1].Url === route) {
            return page[0];
        }
    }
    return null;
}

const goToRouteWithUrl = (route: string, push = true, forceRender = false, scrollToTop = true) => {
    const pages = getPages();

    // don't re-render the same url, except it's forced
    const currentRoute = getCurrentRoute();
    if (currentRoute === route && !forceRender) {
        return;
    }

    const routeName = getRouteNameFromUrl(route);

    // render new page
    if (routeName && pages.has(routeName)) {
        const page = pages.get(routeName);
        if (page) {
            const parent = document.getElementById(page.AppendTo);
            if (parent) {

                const component = new page.Component();

                const renderedPage = render(component);
                if (renderedPage) {
                    document.title = typeof page.Title === 'string' ? page.Title : page.Title();
                    parent.innerHTML = '';
                    parent.appendChild(renderedPage);
                    if (scrollToTop) {
                        window.scrollTo(0, 0);
                    }
                    if (push) {
                        history.pushState(undefined, '', route);
                    }
                }
            }
        } else {
            console.log('page ' + routeName + ' not found');
        }
    } else {
        console.log('route name ' + routeName + ' does not exist', pages);
    }
};

// TODO: base url in production mode
const getCurrentRoute = () => {
    const url = window.location.href;
    const baseUrlLength = 'https://localhost:5005'.length;
    if (url.length <= baseUrlLength) {
        return '/';
    } else {
        return url.substring(baseUrlLength);
    }
}


export {
    PageData,
    goToRouteWithUrl,
    goToRouteWithName,
    initRouter,
    registerPage,
}


