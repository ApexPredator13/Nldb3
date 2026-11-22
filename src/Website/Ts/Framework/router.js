import { renderNavigation } from './Customizable/Layout/navigation';
import { renderMainContainer } from './Customizable/Layout/main';
import { setGlobalChartOptions } from './Customizable/global-chart-options';
import { removeUser } from './Customizable/authentication';
import { renderCookieConsentIfNeeded } from './Customizable/Layout/cookie-consent';

const PAGE_TYPE_EPISODE = 1;
const PAGE_TYPE_ISAAC_RESOURCE = 2;

const pages = [];
let registrationCount = 0;
let onLoadPageType = undefined;
let routerInitialized = false;
let currentBeforeLeaving = null;
let currentRouteKey = null;
let lastPath = '/';
let lastState = null;
let navigationGuard = null;
let pendingInitialRoute = null;

function normalizeRoute(route) {
    if (!route || typeof route !== 'string') {
        return '';
    }

    let cleaned = route.split('#')[0].split('?')[0].trim();
    while (cleaned.startsWith('/')) {
        cleaned = cleaned.substring(1);
    }
    while (cleaned.endsWith('/')) {
        cleaned = cleaned.substring(0, cleaned.length - 1);
    }
    return cleaned;
}

function toBrowserPath(normalizedRoute) {
    return normalizedRoute ? `/${normalizedRoute}` : '/';
}

function safeDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch (e) {
        return value;
    }
}

function routeEndsWith(fragment) {
    return window.location.pathname.toLowerCase().endsWith(String(fragment).toLowerCase());
}

function setOnLoadPageType(pageType) {
    onLoadPageType = pageType;
}

function getOnLoadPageType() {
    return onLoadPageType;
}

const getPages = () => pages;

/**
 * gives the router a new page it can navigate to
 * @param {Function} page - the page constructor function. must have a 'renderPage()' function in its prototype
 * @param {string|Function} title - the page title
 * @param {string[]} url - the route URL segments
 * @param {number} [pageType] - the page type, in case pages share the same URL shape
 * @param {Function} [beforeLeaving] - a function that will be executed before leaving the page - for cleanup work
 */
function registerPage(page, title, url, pageType, beforeLeaving) {
    if (registrationCount++ === 0 && onLoadPageType === undefined) {
        setOnLoadPageType(pageType);
    }

    const urlKey = JSON.stringify(url);
    if (!pages.some(existing => existing.urlKey === urlKey && existing.pageType === pageType)) {
        pages.push({
            page: page,
            title: title,
            url: url,
            urlKey: urlKey,
            pageType: pageType,
            beforeLeaving: beforeLeaving
        });
    }

    // If the user landed directly on a route registered by an async/deferred bundle
    // (e.g. /ManageQuotes, /Admin/Overview, /SubmitVideo/...), render it as soon as it registers.
    if (routerInitialized && pendingInitialRoute !== null) {
        const match = getRequestedPageFromRoute(pendingInitialRoute, onLoadPageType);
        if (match.found) {
            const routeToLoad = pendingInitialRoute;
            pendingInitialRoute = null;
            navigate(routeToLoad, undefined, match.pageData.pageType, false, true, true);
        }
    }
}

function setTitle(title) {
    document.title = title;
}


// event handlers and helper functions for popstate and beforeunload
// =================================================================
/**
 * warns the user before leaving the page
 * @param {BeforeUnloadEvent} e
 */
function beforeUnloadEvent(e) {
    e.preventDefault();
    e.returnValue = '';
}

/** the normal popstate event handler. loads pages depending on what route we are on */
function regularPopstateHandler(e) {
    const currentRoute = getCurrentRoute();
    const statePageType = e && e.state ? e.state.pageType : undefined;
    navigate(currentRoute, undefined, statePageType, false, true, true);
}

/** popstate event handler that intercepts browser back/forward while a guard is active */
function navigationPreventedPopstateHandler() {
    history.pushState(lastState, '', lastPath || window.location.pathname || '/');
    if (navigationGuard && navigationGuard.callback) {
        navigationGuard.callback.call(navigationGuard.caller);
    }
}

/** triggers the browser Back button */
function goBack() {
    window.history.back();
}

/** the normal popstate event handler will be used from now on */
function useRegularPopstateHandler() {
    navigationGuard = null;
    window.removeEventListener('beforeunload', beforeUnloadEvent);
    window.removeEventListener('popstate', navigationPreventedPopstateHandler);
    window.removeEventListener('popstate', regularPopstateHandler);
    window.addEventListener('popstate', regularPopstateHandler);
}

/**
 * intercepts navigation away from the current page until useRegularPopstateHandler() is called
 * @param {Object} caller - THIS context of the object that will be notified whenever navigation is prevented
 * @param {Function} callbackFunction - the callback function that will be called
 */
function dontLetUserNavigateAway(caller, callbackFunction) {
    navigationGuard = {
        caller: caller,
        callback: callbackFunction
    };

    window.removeEventListener('beforeunload', beforeUnloadEvent);
    window.removeEventListener('popstate', navigationPreventedPopstateHandler);
    window.removeEventListener('popstate', regularPopstateHandler);

    window.addEventListener('beforeunload', beforeUnloadEvent);
    window.addEventListener('popstate', navigationPreventedPopstateHandler);
}

// end of helper functions for popstate and beforeunload
// =====================================================


const initRouter = () => {
    if (!routerInitialized) {
        routerInitialized = true;

        setGlobalChartOptions();

        // render layout
        renderNavigation();
        renderMainContainer();
        renderCookieConsentIfNeeded();

        useRegularPopstateHandler();

        const rawRoute = getCurrentRoute();
        const isLogoutHash = window.location.hash === '#logout';
        const removeUserIfNecessary = isLogoutHash ? removeUser() : Promise.resolve();

        removeUserIfNecessary.then(() => {
            const normalizedRoute = normalizeRoute(rawRoute);
            const pageType = getOnLoadPageType();

            const pageData = getRequestedPageFromRoute(normalizedRoute, pageType);
            if (pageData.found) {
                navigate(normalizedRoute, undefined, pageType, false, true, true);
            } else {
                // Keep the browser URL intact while deferred/admin scripts finish registering routes.
                pendingInitialRoute = normalizedRoute;
                const homeMatch = getRequestedPageFromRoute('', undefined);
                if (homeMatch.found) {
                    renderMatchedPage('', homeMatch.pageData, homeMatch.parameters, false, true, false);
                }
            }
        });
    }
};


const getRequestedPageFromRoute = (route, specificPageType) => {
    const normalizedRoute = normalizeRoute(route);
    const routeFragments = normalizedRoute === '' ? [''] : normalizedRoute.split('/');

    let bestMatch = null;
    let bestScore = -1;

    for (const page of pages) {
        if (page.url.length !== routeFragments.length) {
            continue;
        }

        if (page.pageType && (!specificPageType || specificPageType !== page.pageType)) {
            continue;
        }

        const parameters = [];
        let isValid = true;
        let score = 0;

        for (let i = 0; i < routeFragments.length; ++i) {
            const routeFragment = routeFragments[i];
            const pageRouteFragment = page.url[i];

            if (pageRouteFragment.startsWith('{')) {
                parameters.push(safeDecodeURIComponent(routeFragment));
                score += 1;
                continue;
            }

            if (pageRouteFragment.indexOf('|') !== -1) {
                const validPageUrls = pageRouteFragment.split('|');
                const lowerFragment = routeFragment.toLowerCase();
                let match = false;

                for (const validPageUrl of validPageUrls) {
                    if (lowerFragment === validPageUrl.toLowerCase()) {
                        match = true;
                        parameters.push(validPageUrl);
                        score += 2;
                        break;
                    }
                }

                if (match) {
                    continue;
                }
            }

            if (routeFragment.toLowerCase() === pageRouteFragment.toLowerCase()) {
                score += 3;
                continue;
            }

            isValid = false;
            break;
        }

        if (isValid && score > bestScore) {
            bestScore = score;
            bestMatch = {
                found: true,
                pageData: page,
                parameters: parameters
            };
        }
    }

    return bestMatch || { found: false };
};


function renderMatchedPage(normalizedRoute, pageData, parameters, push, scrollToTop, updateHistoryState) {
    if (currentBeforeLeaving) {
        const cleanupFn = currentBeforeLeaving;
        currentBeforeLeaving = null;
        try {
            cleanupFn();
        } catch (e) {
            console.error('Error in page beforeLeaving handler:', e);
        }
    }

    currentBeforeLeaving = pageData.beforeLeaving || null;

    const browserPath = toBrowserPath(normalizedRoute);
    const state = {
        route: normalizedRoute,
        pageType: pageData.pageType
    };

    currentRouteKey = `${normalizedRoute.toLowerCase()}::${pageData.pageType || ''}`;
    lastPath = browserPath;
    lastState = state;

    if (updateHistoryState) {
        if (push) {
            history.pushState(state, '', browserPath);
        } else {
            history.replaceState(state, '', browserPath);
        }
    }

    const pageInstance = new pageData.page(parameters);
    pageInstance.renderPage();

    document.title = typeof pageData.title === 'string' ? pageData.title : pageData.title();

    if (scrollToTop) {
        window.scrollTo(0, 0);
    }
}


const navigate = (requestedRoute, preventDefaultForEvent, specificPageType, push = true, forceRender = false, scrollToTop = true) => {
    if (preventDefaultForEvent) {
        preventDefaultForEvent.preventDefault();
    }

    if (navigationGuard && navigationGuard.callback) {
        navigationGuard.callback.call(navigationGuard.caller);
        return;
    }

    pendingInitialRoute = null;

    const normalizedRoute = normalizeRoute(requestedRoute);
    const { found, pageData, parameters } = getRequestedPageFromRoute(normalizedRoute, specificPageType);

    if (!found || !pageData || !parameters) {
        return;
    }

    const targetRouteKey = `${normalizedRoute.toLowerCase()}::${pageData.pageType || ''}`;
    if (currentRouteKey === targetRouteKey && !forceRender) {
        return;
    }

    renderMatchedPage(normalizedRoute, pageData, parameters, push, scrollToTop, true);
};

const getCurrentRoute = () => {
    const pathname = window.location.pathname;
    if (!pathname || pathname === '/') {
        return '/';
    }
    return pathname;
};


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
};
