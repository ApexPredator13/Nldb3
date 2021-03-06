﻿import { WebStorageStateStore, UserManager, User, Log } from 'oidc-client';
import { removeHashAndQuerystring, getHashFromUrl, loadSciptIfNotExists } from '../browser';
import { getConfig } from './config.development';


let userWasFoundActionsExecuted = false;

/** 
 *  returns a usermanager instance, creates one if necessary 
 *  @returns {UserManager}
 */
function getUserManager() {
    if (window.userManager) {
        return window.userManager;
    }

    const config = getConfig();
    const baseUrlOfThisWebsite = config.baseUrlWithoutTrailingSlash;

    const settings = {
        authority: baseUrlOfThisWebsite,
        client_id: 'local-javascript-app',
        redirect_uri: baseUrlOfThisWebsite,
        silent_redirect_uri: `${baseUrlOfThisWebsite}/SilentSignin`,
        automaticSilentRenew: true,
        monitorSession: true,
        checkSessionInterval: 10,
        response_type: 'code',
        scope: 'openid offline_access profile email roles',
        loadUserInfo: true,
        post_logout_redirect_uri: baseUrlOfThisWebsite,
        revokeAccessTokenOnSignout: true,
        userStore: new WebStorageStateStore({ store: window.sessionStorage })
    };

    var userManager = new UserManager(settings);
    userManager.clearStaleState();
    window.userManager = userManager;
    return window.userManager;
}


/**
 * returns the currently logged in user, or null if no user was found
 * @returns {Promise<User|null>}
 */
const getUser = async (checkSilentSignin) => {
    const userManager = getUserManager();

    /** @type {User|null} */
    let user = null;

    // check if logout happened
    if (getHashFromUrl() === 'logout') {
        removeHashAndQuerystring();
        await userManager.removeUser();
        return null;
    }

    try {
        // check if user logged himself in right now
        if (window.location.href.indexOf('?code=') !== -1) {
            user = await userManager.signinRedirectCallback();
            if (user) {
                removeHashAndQuerystring();
            }
        }

        // check if user exists already
        if (!user) {
            user = await userManager.getUser();
        }

        // check if user is logged in on the oidc-provider
        if (!user && checkSilentSignin) {
            user = await userManager.signinSilent();
        }

        // if user exists, do after-login-setup and return user,
        // otherwise do cleanup and return null
        if (user) {
            await userLoggedInSetup(user);
            return user;
        } else {
            await userManager.removeUser();
            return null;
        }
    } catch (e) {
        if (e instanceof Error) {
            if (e.message.toLowerCase().indexOf('future') !== -1) {
                window.alert('Login Failed! Possible Reasons: Your system clock is out of sync. Login time does not match the time of this action, so it was prohibited.');
            }
        }
        removeHashAndQuerystring();
        await userManager.clearStaleState();
        await userManager.removeUser();
        return null;
    }
}

const createCustomErrorMessage = (obj, prop) => {
    const potentialErrormessage = obj[prop];
    if (potentialErrormessage && typeof(potentialErrormessage) === 'string' && potentialErrormessage.toLowerCase().indexOf('future') !== -1) {
        return 'Login Failed! Possible Reasons: Your system clock is out of sync. Login time does not match the time of this action, so it was prohibited.';
    }

    return null;
}

/** redirects the user to the login page */
const signin = () => {
    const userManager = getUserManager();
    userManager.signinRedirect();
}


/** redirects the user to the logout page */
const signout = () => {
    const userManager = getUserManager();
    userManager.signoutRedirect();
}


/**
 * checks whether the user has the 'Admin' role claim set
 * @param {User|null} user
 * @returns {boolean}
 */
const isAdmin = (user) => {
    if (!user || !user.profile) {
        return false;
    }

    if (user.profile['role'] === 'admin') {
        return true;
    }

    return false;
}


/** 
 *  loads the admin backend if user is admin 
 *  @returns {Promise}
 */
const tryloadAdminPages = user => {
    if (isAdmin(user)) {
        return loadSciptIfNotExists('/js/dist/all_admin_pages.min.js');
    } else {
        return Promise.resolve();
    }
}


/** 
 *  loads the 'submit video' page for the logged in user 
 *  @returns {Promise}
 */
const loadSubmitVideoPage = () => {
    return loadSciptIfNotExists('/js/dist/submit_episode.min.js');
}


/**
 * runs once, after a user was found.
 * used to load admin backend and pages that only registered users can access
 * @param {User} user - the logged in user
 */
const userLoggedInSetup = user => {
    // only do this once
    if (!userWasFoundActionsExecuted) {
        userWasFoundActionsExecuted = true;

        return Promise.all([
            loadSubmitVideoPage(),
            tryloadAdminPages(user)
        ]);
    } else {
        return Promise.resolve();
    }
}


const removeUser = () => {
    const userManager = getUserManager();
    return userManager.removeUser();
}


export {
    getUser,
    signin,
    signout,
    isAdmin,
    tryloadAdminPages,
    loadSubmitVideoPage,
    removeUser
}

