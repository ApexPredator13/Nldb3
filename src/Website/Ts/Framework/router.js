import { renderNavigation } from './Customizable/Layout/navigation';
import { renderMainContainer } from './Customizable/Layout/main';
import { setGlobalChartOptions } from './Customizable/global-chart-options';
import { getConfig } from './Customizable/config.development';

const PAGE_TYPE_EPISODE = 1;
const PAGE_TYPE_ISAAC_RESOURCE = 2;

let registrationCount = 0;

function routeEndsWith(fragment) {
    return window.location.href.endsWith(fragment);
}

function setOnLoadPageType(pageType) {
    window.page_type = pageType;
}

function getOnLoadPageType() {
    return window.page_type;
}

const getPages = () => {
    if (!window.p) {
        window.p = [];
    }
    return window.p;
}

function registerPage(page, title, url, pageType, afterRender, beforeLeaving, canLeave) {
    if (registrationCount++ === 0) {
        setOnLoadPageType(pageType);
    }

    const pages = getPages();
    if (!pages.some(page => JSON.stringify(page.url) === JSON.stringify(url))) {
        pages.push({
            page: page,
            title: title,
            url: url,
            pageType: pageType,
            afterRender: afterRender,
            beforeLeaving: beforeLeaving,
            canLeave: canLeave
        });
    }
}

function setTitle(title) {
    document.title = title;
}


const initRouter = () => {
    if (!window.routerInit) {
        window.routerInit = true;

        setGlobalChartOptions();

        // render layout
        renderNavigation();
        renderMainContainer();

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
        const pageType = getOnLoadPageType();
        navigate(currentRoute, undefined, pageType, false, true);
    }
};


const getRequestedPageFromRoute = (route, specificPageType) => {
    const result = {
        found: false
    };

    // split route into fragments
    const pages = getPages();
    const routeFragments = route.split('/');
    const parameters = [];

    // check every page until one is found
    for (const page of pages) {

        // route fragment amount doesn't match? done. check next page
        if (page.url.length !== routeFragments.length) {
            continue;
        }

        // forced page type doesn't match? done. check next page
        if (page.pageType) {
            if (!specificPageType || (specificPageType !== page.pageType)) {
                continue;
            }
        }

        // check if all route fragments of the page are valid
        let isValid = true;
        for (let i = 0; i < routeFragments.length; ++i) {
            const routeFragment = routeFragments[i];
            const pageRouteFragment = page.url[i];

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
                        parameters.push(validPageUrl);
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


const navigate = (requestedRoute, preventDefaultForEvent, specificPageType, push = true, forceRender = false, scrollToTop = true) => {
    if (preventDefaultForEvent) {
        preventDefaultForEvent.preventDefault();
    }

    if (requestedRoute.startsWith('/')) {
        requestedRoute = requestedRoute.substring(1);
    }

    const { found, page, parameters } = getRequestedPageFromRoute(requestedRoute, specificPageType);
    console.log(`page found for "${requestedRoute}"? ${found}`, page, parameters);
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
    const lastUrl = window.lastUrl;
    const allowedToLeave = window.leavingAllowed;

    if (allowedToLeave) {
        const leavingIsOk = allowedToLeave();
        if (!leavingIsOk) {
            // reverse popstate if navigation was cancelled
            history.pushState(undefined, '', lastUrl);
            return;
        }
    }

    // check if cleanup work has to be done before navigating
    const beforeLeaving = window.beforeLeaving;
    if (beforeLeaving) {
        beforeLeaving();
    }

    // save leaving guard
    if (page.canLeave) {
        window.leavingAllowed = page.canLeave;
    } else {
        window.leavingAllowed = null;
    }

    // save new beforeLeaving action
    if (page.beforeLeaving) {
        window.beforeLeaving = page.beforeLeaving;
    } else {
        window.beforeLeaving = null;
    }

    // render new page
    page.page(parameters);

    // handle pushState
    if (push) {
        if (!requestedRoute.startsWith('/')) {
            requestedRoute = '/' + requestedRoute;
        }
        console.log('pushing state', requestedRoute);
        history.pushState(undefined, '', requestedRoute);

        // save this url as last url
        window.lastUrl = requestedRoute;
    }

    document.title = typeof page.title === 'string' ? page.title : page.title();

    if (scrollToTop) {
        window.scrollTo(0, 0);
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
    navigate,
    initRouter,
    registerPage,
    setTitle,
    routeEndsWith,
    getPages,
    getCurrentRoute,
    setOnLoadPageType,
    getOnLoadPageType,
    PAGE_TYPE_EPISODE,
    PAGE_TYPE_ISAAC_RESOURCE
}


