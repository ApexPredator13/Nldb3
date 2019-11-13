import { render, Component } from './renderer';
import { NavigationComponent } from '../Pages/Layout/navigation';
import { MainComponent } from '../Pages/Layout/main';
import { registerPopupEvent } from './popup';

interface PageData {
    AppendTo: string,
    Component: new() => Component,
    Title: string | (() => string),
    Urls: Array<string>,
    Data?: any
}

const setPageData = (pageName: string, data: any) => {
    const pages = getPages();
    if (pages.has(pageName)) {
        const page = pages.get(pageName);
        if (page) {
            console.log('setting page data for page', pageName, data);
            page.Data = data;
        }
    }
}

const setUrlData = (url: string, data: any) => {
    const pages = getPages();
    const foundName = getRegisteredRouteNameFromRegisteredUrl(url, pages);
    if (foundName) {
        if (foundName.exactMatch) {
            setPageData(foundName.exactMatch, data);
        } else if (foundName.approximateMatch) {
            for (const approximateMatch in foundName.approximateMatch) {
                setPageData(approximateMatch, data);
            }
        }
    }
}

const appendRouteFragment = (fragment: string) => {
    if (!fragment.startsWith('/')) {
        fragment = `/${fragment}`;
    }
    history.replaceState(undefined, document.title, `${window.location.href}${fragment}`);
}

const routeEndsWith = (fragment: string) => {
    if (window.location.href.endsWith(fragment)) {
        return true;
    } else {
        return false;
    }
}

function getPageData<T>(): T | undefined {
    const currentRoute = getCurrentRouteUrl();
    console.log('current route: ', currentRoute);
    const pages = getPages();
    for (const page of pages) {
        const findRouteResult = getRegisteredRouteNameFromRegisteredUrl(page[0], pages);
        console.log('result for ' + currentRoute, findRouteResult);
        if (findRouteResult.exactMatch || (findRouteResult.approximateMatch && findRouteResult.approximateMatch.length > 0)) {
            return page[1].Data;
        }
    }

    return undefined;
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

const setTitle = (title: string) => {
    document.title = title;
}

const initRouter = () => {
    if (!(window as any).routerInit) {

        // register custom events
        registerPopupEvent();

        // render layout
        const navigation = render(new NavigationComponent());

        const main = render(new MainComponent());

        if (main && navigation) {
            document.body.appendChild(navigation);
            document.body.appendChild(main);
        }

        // delay enough so that initial popstate event that some browsers trigger on load will be skipped
        setTimeout(() => {
            window.addEventListener('popstate', () => {
                const url = getCurrentRouteUrl();
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

type findRouteResult = {
    exactMatch?: string,
    approximateMatch: Array<string>
}

const getRegisteredRouteNameFromRegisteredUrl = (route: string, pages: Map<string, PageData>): findRouteResult => {
    const result: findRouteResult = {
        exactMatch: undefined,
        approximateMatch: new Array<string>()
    };

    for (const page of pages) {
        for (const url of page[1].Urls) {
            if (url.toLowerCase() === route.toLowerCase()) {
                result.exactMatch = page[0];
                return result;
            } else if (url !== '/' && route.toLowerCase().startsWith(url.toLowerCase())) {
                result.approximateMatch.push(page[0]);
            }
        }
    }

    return result;
}

const goToRouteWithName = (routeName: string, push = true, forceRender = false, scrollToTop = true, urlIndex = 0) => {
    const pages = getPages();
    for (const page of pages) {
        if (page[0] === routeName) {
            goToRouteWithUrl(page[1].Urls[urlIndex], push, forceRender, scrollToTop);
            return;
        }
    }
}


const goToRouteWithUrl = (route: string, push = true, forceRender = false, scrollToTop = true) => {
    const pages = getPages();

    // don't re-render the same url, except it's forced
    const currentRoute = getCurrentRouteUrl();
    if (currentRoute === route && !forceRender) {
        return;
    }

    const foundRoutes = getRegisteredRouteNameFromRegisteredUrl(route, pages);
    if (!foundRoutes.exactMatch && foundRoutes.approximateMatch.length === 0) {
        console.warn('route ' + route + ' was not found');
        return;
    }

    // render new page
    const pageName = foundRoutes.exactMatch ? foundRoutes.exactMatch : foundRoutes.approximateMatch[0];
    const page = pages.get(pageName);

    if (!page) {
        console.warn('page was found by getRegisteredRouteNameFromRegisteredUrl, but not in the registered pages map!');
        return;
    }

    const parent = document.getElementById(page.AppendTo);
    if (parent) {

        if (push) {
            history.pushState(undefined, '', route);
        }

        const component = new page.Component();
        const renderedPage = render(component);

        if (renderedPage) {
            document.title = typeof page.Title === 'string' ? page.Title : page.Title();
            parent.innerHTML = '';
            parent.appendChild(renderedPage);
            if (scrollToTop) {
                window.scrollTo(0, 0);
            }
        }
    }
};

// TODO: base url in production mode
const getCurrentRouteUrl = () => {
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
    setPageData,
    getPageData,
    setTitle,
    appendRouteFragment,
    routeEndsWith,
    getRegisteredRouteNameFromRegisteredUrl,
    getPages,
    setUrlData
}


