import { render, Component } from './renderer';
import { NavigationComponent } from './Customizable/Layout/navigation';
import { MainComponent } from './Customizable/Layout/main';
import { OtherElements } from './Customizable/Layout/other';
import { setGlobalChartOptions } from './Customizable/global-chart-options';
import { getConfig } from './Customizable/config.development';
import { registerPopupEvent } from './ComponentBaseClasses/component-with-popup';

enum PageType {
    Episode = 1,
    IsaacResource
}

interface PageData {
    AppendTo?: string,
    Component: new(routeParameters: Array<string>) => Component,
    Title: string | (() => string),
    Url: Array<string>,
    specificPageType?: PageType,
    afterRender?: () => any,
    beforeLeaving?: () => any,
    canLeave?: () => boolean
}

const routeEndsWith = (fragment: string) => {
    if (window.location.href.endsWith(fragment)) {
        return true;
    } else {
        return false;
    }
}

const addAfterRenderActionToPage = (route: string, fun: () => any, requestedPageType?: PageType) => {
    if (route.startsWith('/')) {
        route = route.substring(1);
    }
    const page = getRequestedPageFromRoute(route, requestedPageType);
    if (page && page.page) {
        page.page.afterRender = fun;
    }
}

const extractParametersFromRoute = (amount: number): Array<string> => {
    const route = getCurrentRoute();
    const routeParts = route.split('/');
    if (routeParts.length < amount) {
        return new Array<string>();
    }
    const parameters = routeParts.reverse().splice(0, amount);
    return parameters;
}

const getPages = () => {
    if (!(window as any).pages) {
        (window as any).pages = new Array<PageData>();
    }

    const pages = (window as any).pages as Array<PageData>;
    return pages;
}

const setGlobalPageType = (pageType: PageType | undefined) => {
    (window as any).page_type = pageType;
}

const getGlobalPageType = (): PageType | undefined => {
    return (window as any).page_type;
}

let registrationCount = 0;

const registerPage = (pageData: PageData) => {
    // save page type globally, so that it's available on first page load
    if (registrationCount === 0) {
        setGlobalPageType(pageData.specificPageType);
    }

    registrationCount++;

    // then save page
    const pages = getPages();
    const pageExists = pages.some(page => JSON.stringify(page.Url) === JSON.stringify(pageData.Url))
    if (!pageExists) {
        pages.push(pageData);
    }
}

const setTitle = (title: string) => {
    document.title = title;
}

const initRouter = () => {
    if (!(window as any).routerInit) {
        // register custom events
        registerPopupEvent();
        setGlobalChartOptions();

        // render layout
        const navigation = render(new NavigationComponent());
        const main = render(new MainComponent());
        const other = render(new OtherElements());

        if (main && navigation && other) {
            document.body.appendChild(navigation);
            document.body.appendChild(main);
            document.body.appendChild(other);
        }

        // delay enough so that initial popstate event that some browsers trigger on load will be skipped
        setTimeout(() => {
            window.addEventListener('popstate', () => {
                const currentRoute = getCurrentRoute();
                const page = getRequestedPageFromRoute(getCurrentRoute());
                navigate(currentRoute, undefined, page.page ? page.page.specificPageType : undefined, false, true);
            });
        }, 100);

        // load initial page, only one should exist at the start
        const currentRoute = getCurrentRoute();
        const pageType = getGlobalPageType();
        navigate(currentRoute, undefined, pageType, false, true);
    }
    (window as any).routerInit = true;
};

type findPageResult = {
    page?: PageData,
    parameters?: Array<string>,
    found: boolean
}


const getRequestedPageFromRoute = (route: string, specificPageType?: PageType): findPageResult => {
    const result: findPageResult = {
        found: false
    };
    
    // split route into fragments
    const pages = getPages();
    const routeFragments = route.split('/');
    const parameters = new Array<string>();

    // check every page until one is found
    for (const page of pages) {

        // route fragment amount doesn't match? done. check next page
        if (page.Url.length !== routeFragments.length) {
            continue;
        }

        // forced page type doesn't match? done. check next page
        if (page.specificPageType) {
            if (!specificPageType || (specificPageType !== page.specificPageType)) {
                continue;
            }
        }

        // check if all route fragments of the page are valid
        let isValid = true;
        for (let i = 0; i < routeFragments.length; ++i) {
            const routeFragment = routeFragments[i];
            const pageRouteFragment = page.Url[i];

            // fragment is route parameter? ok! save it and check next fragment!
            if (pageRouteFragment.startsWith('{')) {
                parameters.push(routeFragment);
                continue;
            }

            // fragment is part of Possibility1|Possibility2|Possibility3 ? ok! check next fragment!
            if (pageRouteFragment.indexOf('|') !== -1) {
                const validPageUrls = pageRouteFragment.split('|');

                let match = false;
                for (const validPageUrl of validPageUrls) {
                    if (routeFragment.toLowerCase() === validPageUrl.toLowerCase()) {
                        match = true;
                        break;
                    }
                }

                // if we have a match, ok! check next fragment!
                if (match) {
                    continue;
                }
            }

            // fragment has same name? ok! check next fragment!
            if (routeFragment.toLowerCase() === pageRouteFragment.toLowerCase()) {
                continue;
            }

            // in any other case, this page is invalid
            isValid = false;
            break;
        }

        // if the page is valid, return it
        if (isValid) {
            result.page = page;
            result.parameters = parameters;
            result.found = true;
            break;
        }
    }

    return result;
}


const navigate = (
    requestedRoute: string,
    preventDefaultForEvent: Event | undefined = undefined,
    specificPageType: PageType | undefined = undefined,
    push = true,
    forceRender = false,
    scrollToTop = true
) => {
    if (preventDefaultForEvent) {
        preventDefaultForEvent.preventDefault();
    }

    if (requestedRoute.startsWith('/')) {
        requestedRoute = requestedRoute.substring(1);
    }

    const { found, page, parameters } = getRequestedPageFromRoute(requestedRoute, specificPageType);
    console.log(`page found for "${requestedRoute}"? ${found}`, page);
    const currentRoute = getCurrentRoute();

    if (!found || !page || !parameters) {
        console.log('page not found. registered pages:', getPages());
        return;
    }

    // don't re-render the same url, except it's forced
    if (currentRoute === requestedRoute && !forceRender) {
        return;
    }

    // check if user can leave the page unprompted or if we have a 'progress will not be saved' situation
    const lastUrl = (window as any).lastUrl as string | null | undefined;
    const allowedToLeave = (window as any).leavingAllowed as (() => boolean) | null | undefined;

    if (allowedToLeave) {
        const leavingIsOk = allowedToLeave();
        if (!leavingIsOk) {
            // reverse popstate if navigation was cancelled
            history.pushState(undefined, '', lastUrl);
            return;
        }
    }

    // check if cleanup work has to be done before navigating
    const beforeLeaving = (window as any).beforeLeaving as (() => any) | null | undefined;
    if (beforeLeaving) {
        beforeLeaving();
    }

    // save leaving guard
    if (page.canLeave) {
        (window as any).leavingAllowed = page.canLeave;
    } else {
        (window as any).leavingAllowed = null;
    }

    // save new beforeLeaving action
    if (page.beforeLeaving) {
        (window as any).beforeLeaving = page.beforeLeaving;
    } else {
        (window as any).beforeLeaving = null;
    }

    // render new page
    const parent = document.getElementById(page.AppendTo ? page.AppendTo : 'main-container');
    if (parent) {

        if (push) {
            if (!requestedRoute.startsWith('/')) {
                requestedRoute = '/' + requestedRoute;
            }
            console.log('pushing state', requestedRoute);
            history.pushState(undefined, '', requestedRoute);

            // save this url as last url
            (window as any).lastUrl = requestedRoute;
        }

        const component = new page.Component(parameters);
        const renderedPage = render(component);

        if (renderedPage) {
            document.title = typeof page.Title === 'string' ? page.Title : page.Title();
            parent.innerHTML = '';

            if (page.afterRender) {
                const observer = new MutationObserver(() => {
                    if (page.afterRender) {
                        page.afterRender();
                    }
                    observer.disconnect();
                });
                observer.observe(parent, { childList: true });
            }

            parent.appendChild(renderedPage);
            if (scrollToTop) {
                window.scrollTo(0, 0);
            }


            setTimeout(() => {
                if (page.afterRender) {
                    page.afterRender();
                }
            }, 300);
        }
    }
};

// TODO: base url in production mode
const getCurrentRoute = () => {
    const config = getConfig();
    const url = window.location.href;
    const baseUrlLength = config.baseUrlWithoutTrailingSlash.length;
    if (url.length <= baseUrlLength || url.indexOf('?code=') !== -1) {
        return '/';
    } else {
        return url.substring(baseUrlLength);
    }
}


export {
    PageData,
    PageType,
    navigate,
    initRouter,
    registerPage,
    setTitle,
    routeEndsWith,
    getPages,
    getCurrentRoute,
    extractParametersFromRoute,
    addAfterRenderActionToPage,
    setGlobalPageType
}


