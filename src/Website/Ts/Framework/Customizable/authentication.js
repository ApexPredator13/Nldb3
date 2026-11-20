import { loadSciptIfNotExists } from '../browser';

let userWasFoundActionsExecuted = false;
let cachedAuthState = null;
let pendingAuthPromise = null;

/**
 * Fetches current auth state and CSRF token from the backend using same-origin cookies.
 * @param {boolean} forceRefresh
 * @returns {Promise<{ user: object|null, csrfToken: string|null }>}
 */
async function fetchAuthState(forceRefresh = false) {
    if (!forceRefresh && cachedAuthState) {
        return cachedAuthState;
    }

    if (!forceRefresh && pendingAuthPromise) {
        return pendingAuthPromise;
    }

    pendingAuthPromise = fetch('/Api/Auth/Me', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store'
    })
        .then(async response => {
            if (!response.ok) {
                return { user: null, csrfToken: null };
            }

            const data = await response.json();
            const user = data && data.isAuthenticated
                ? {
                    name: data.name,
                    isAdmin: Boolean(data.isAdmin),
                    profile: {
                        name: data.name,
                        role: data.isAdmin ? 'admin' : null
                    }
                }
                : null;

            return {
                user: user,
                csrfToken: data ? data.csrfToken || null : null
            };
        })
        .catch(() => ({ user: null, csrfToken: null }))
        .then(state => {
            cachedAuthState = state;
            pendingAuthPromise = null;
            return state;
        });

    return pendingAuthPromise;
}

/**
 * Returns the currently logged in user, or null if not authenticated.
 * @param {boolean} [forceRefresh]
 * @returns {Promise<object|null>}
 */
const getUser = async (forceRefresh = false) => {
    const state = await fetchAuthState(forceRefresh);

    if (state.user) {
        await userLoggedInSetup(state.user);
        return state.user;
    }

    return null;
};

/**
 * Returns the current anti-forgery token for state-changing API requests.
 * @returns {Promise<string|null>}
 */
const getCsrfToken = async () => {
    const state = await fetchAuthState(false);
    return state.csrfToken;
};

/** redirects the user to the login page */
const signin = () => {
    const returnUrl = window.location.pathname + window.location.search;
    window.location.href = `/Account/Login?returnUrl=${encodeURIComponent(returnUrl)}`;
};

/** redirects the user to the logout page */
const signout = () => {
    window.location.href = '/Account/Logout';
};

/**
 * checks whether the user has the 'admin' role
 * @param {object|null} user
 * @returns {boolean}
 */
const isAdmin = (user) => {
    if (!user) {
        return false;
    }

    if (user.isAdmin === true) {
        return true;
    }

    return Boolean(user.profile && user.profile['role'] === 'admin');
};

/**
 * loads the admin backend if user is admin
 * @returns {Promise}
 */
const tryloadAdminPages = user => {
    if (isAdmin(user)) {
        return loadSciptIfNotExists('/js/dist/all_admin_pages.min.js');
    } else {
        return Promise.resolve();
    }
};

/**
 * loads the 'submit video' page for the logged in user
 * @returns {Promise}
 */
const loadSubmitVideoPage = () => {
    return loadSciptIfNotExists('/js/dist/submit_episode.min.js');
};

/**
 * runs once, after a user was found.
 * used to load admin backend and pages that only registered users can access
 * @param {object} user
 */
const userLoggedInSetup = user => {
    if (!userWasFoundActionsExecuted) {
        userWasFoundActionsExecuted = true;

        return Promise.all([
            loadSubmitVideoPage(),
            tryloadAdminPages(user)
        ]);
    } else {
        return Promise.resolve();
    }
};

const removeUser = () => {
    cachedAuthState = null;
    pendingAuthPromise = null;
    userWasFoundActionsExecuted = false;
    return Promise.resolve();
};

export {
    getUser,
    getCsrfToken,
    signin,
    signout,
    isAdmin,
    tryloadAdminPages,
    loadSubmitVideoPage,
    removeUser
};
