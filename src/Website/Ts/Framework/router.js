import { renderNavigation } from './Customizable/Layout/navigation';
import { renderMainContainer } from './Customizable/Layout/main';
import { setGlobalChartOptions } from './Customizable/global-chart-options';
import { getConfig } from './Customizable/config.development';
import { removeUser } from './Customizable/authentication';
import { renderCookieConsentIfNeeded } from './Customizable/Layout/cookie-consent';

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

/**
 * gives the router a new page he can navigate to
 * @param {Function} page - the page constructor function. must have a 'renderPage()' function in its prototype
 * @param {string} title - the page title
 * @param {string[]} url - the route URL
 * @param {number} [pageType] - the page type, in case pages have the same url
 * @param {Function} [beforeLeaving] - a function that will be executed before leaving the page - for cleanup work
 */
function registerPage(page, title, url, pageType, beforeLeaving) {
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
            beforeLeaving: beforeLeaving,
        });
    }
}

function setTitle(title) {
    document.title = title;
}



// event handlers and helper functions for popstate and beforeunload
// =================================================================
/**
 * warns the user before leaving the page
 * @param {Event} e - the raw beforeunload event
 */
function beforeUnloadEvent(e) {
    e.preventDefault();
    e.returnValue = '';
}

/** the normal popstate event handler. loads pages depending on what route we are on */
function regularPopstateHandler() {
    window.cannotLeave = false;
    const currentRoute = getCurrentRoute();
    const page = getRequestedPageFromRoute(currentRoute);
    navigate(currentRoute, undefined, page.page ? page.page.specificPageType : undefined, false, true);
}

/** popstate event handler that will stop the browser backbutton navigation */
function navigationPreventedPopstateHandler() {
    if (window.popStateCallback && window.popStateCaller) {
        window.popStateCallback.call(window.popStateCaller);
    }
    window.cannotLeave = true;
    history.pushState(null, null, window.lastUrl);
}



/** triggers the browser Back button */
function goBack() {
    window.history.back();
}

/** the normal popstate event handler will be used from now on */
function useRegularPopstateHandler() {
    // clean everything up
    window.removeEventListener('beforeunload', beforeUnloadEvent);
    window.removeEventListener('popstate', navigationPreventedPopstateHandler);
    window.removeEventListener('popstate', regularPopstateHandler);
    // attach the regular popstate event
    window.addEventListener('popstate', regularPopstateHandler);
}

/**
 * the 'remove all basic browser navigation' event handler will be used from now on
 * @param {Object} caller - THIS context of the object that will be notified whenever a navigation is prevented
 * @param {Function} callbackFunction - the callback function that will be called
 */
function dontLetUserNavigateAway(caller, callbackFunction) {
    // globally save context and callback function
    window.popStateCaller = caller;
    window.popStateCallback = callbackFunction;

    // clean everything up
    window.removeEventListener('beforeunload', beforeUnloadEvent);
    window.removeEventListener('popstate', navigationPreventedPopstateHandler);
    window.removeEventListener('popstate', regularPopstateHandler);

    // add event listeners
    window.addEventListener('beforeunload', beforeUnloadEvent);
    window.addEventListener('popstate', navigationPreventedPopstateHandler); 
}

// end of helper functions for popstate and beforeunload
// =====================================================



const initRouter = () => {
    if (!window.routerInit) {
        window.routerInit = true;

        setGlobalChartOptions();

        // render layout
        renderNavigation();
        renderMainContainer();
        renderCookieConsentIfNeeded();

        // delay enough so that initial popstate event that some browsers trigger on load will be skipped
        setTimeout(() => {
            useRegularPopstateHandler();
        }, 100);

        // load initial page, only one should exist at the start
        let currentRoute = getCurrentRoute();
        const removeUserIfNecessary = currentRoute.endsWith('#logout') ? removeUser() : Promise.resolve();

        removeUserIfNecessary.then(() => {
            if (currentRoute.startsWith('/')) {
                currentRoute = currentRoute.substring(1);
            }

            const pageType = getOnLoadPageType();

            const pageData = getRequestedPageFromRoute(currentRoute, pageType);
            if (pageData.found) {
                navigate(currentRoute, undefined, pageType, false, true, true);
            } else {
                navigate('', undefined, undefined, true, true, true);
            }
        });
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
            result.pageData = page;
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

    if (window.cannotLeave) {
        return;
    }

    if (requestedRoute.startsWith('/')) {
        requestedRoute = requestedRoute.substring(1);
    }

    const { found, pageData, parameters } = getRequestedPageFromRoute(requestedRoute, specificPageType);
    const currentRoute = getCurrentRoute();

    if (!found || !pageData || !parameters) {
        return;
    }

    // don't re-render the same url, except it's forced
    if (currentRoute === requestedRoute && !forceRender) {
        return;
    }

    // check if cleanup work has to be done before navigating
    const beforeLeaving = window.beforeLeaving;
    if (beforeLeaving) {
        beforeLeaving();
    }

    // save new beforeLeaving action
    if (pageData.beforeLeaving) {
        window.beforeLeaving = pageData.beforeLeaving;
    } else {
        window.beforeLeaving = null;
    }

    // render new page
    const p = new pageData.page(parameters);
    p.renderPage();

    // handle pushState
    if (push) {
        if (!requestedRoute.startsWith('/')) {
            requestedRoute = '/' + requestedRoute;
        }
        history.pushState(undefined, '', requestedRoute);

        // save this url as last url
        window.lastUrl = requestedRoute;
    }

    document.title = typeof pageData.title === 'string' ? pageData.title : pageData.title();

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
    PAGE_TYPE_ISAAC_RESOURCE,
    useRegularPopstateHandler,
    dontLetUserNavigateAway,
    goBack
}


