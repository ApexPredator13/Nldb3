import { render, Component } from './renderer';
import { NavigationComponent } from './Customizable/Layout/navigation';
import { MainComponent } from './Customizable/Layout/main';
import { registerPopupEvent } from './popup';

enum PageType {
    Episode = 1,
    IsaacResource
}

interface PageData {
    AppendTo?: string,
    Component: new(routeParameters: Array<string>) => Component,
    Title: string | (() => string),
    Url: Array<string>,
    specificPageType?: PageType
}

const routeEndsWith = (fragment: string) => {
    if (window.location.href.endsWith(fragment)) {
        return true;
    } else {
        return false;
    }
}

const extractParametersFromRoute = (amount: number): Array<string> => {
    const route = getCurrentRoute();
    const routeParts = route.split('/');
    if (routeParts.length < amount) {
        return new Array<string>();
    }
    const parameters = routeParts.reverse().splice(0, amount);
    console.log(parameters);
    return parameters;
}

const getPages = () => {
    if (!(window as any).pages) {
        (window as any).pages = new Array<PageData>();
    }

    const pages = (window as any).pages as Array<PageData>;
    return pages;
}

const registerPage = (pageData: PageData) => {
    const pages = getPages();
    const pageExists = pages.some(page => JSON.stringify(page.Url) === JSON.stringify(pageData.Url))
    if (!pageExists) {
        console.info('registering page: ', pageData.Url.join('/'));
        pages.push(pageData);
    } else {
        console.info('page already exists: ', pageData.Url.join('/'));
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
                const currentRoute = getCurrentRoute();
                const page = getRequestedPageFromRoute(getCurrentRoute());
                navigate(currentRoute, page.page ? page.page.specificPageType : undefined, false, true);
            });
        }, 100);

        // load initial page, only one should exist at the start
        const currentRoute = getCurrentRoute();
        const page = getRequestedPageFromRoute(getCurrentRoute());
        navigate(currentRoute, page.page ? page.page.specificPageType : undefined, false, true);
    }
    (window as any).routerInit = true;
};

type findPageResult = {
    page?: PageData,
    parameters?: Array<string>,
    found: boolean
}


const getRequestedPageFromRoute = (route: string, specificPageType?: PageType): findPageResult => {
    console.log('finding page for route:', route);
    if (specificPageType) {
        console.log('...with specific page type:', specificPageType);
    }
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
                console.log('parameter detected in route!', routeFragment);
                parameters.push(routeFragment);
                continue;
            }

            // fragment is part of Possibility1|Possibility2|Possibility3 ? ok! check next fragment!
            if (pageRouteFragment.indexOf('|') !== -1) {
                const validPageUrls = pageRouteFragment.split('|');
                console.log('valid page urls:', validPageUrls);

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
        } else {
            console.warn('page invalid!', page);
        }
    }

    return result;
}


const navigate = (requestedRoute: string, specificPageType: PageType | undefined = undefined, push = true, forceRender = false, scrollToTop = true) => {
    if (requestedRoute.startsWith('/')) {
        requestedRoute = requestedRoute.substring(1);
    }

    const { found, page, parameters } = getRequestedPageFromRoute(requestedRoute, specificPageType);
    console.log('PAGE DETAILS');
    console.log('found', found);
    console.log('page', page);
    console.log('parameters', parameters);

    const currentRoute = getCurrentRoute();

    if (!found || !page || !parameters) {
        return;
    }

    // don't re-render the same url, except it's forced
    if (currentRoute === requestedRoute && !forceRender) {
        return;
    }

    // render new page
    const parent = document.getElementById(page.AppendTo ? page.AppendTo : 'main-container');
    if (parent) {

        if (push) {
            history.pushState(undefined, '', requestedRoute);
        }

        const component = new page.Component(parameters);
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
    PageType,
    navigate,
    initRouter,
    registerPage,
    setTitle,
    routeEndsWith,
    getPages,
    getCurrentRoute,
    extractParametersFromRoute
}


