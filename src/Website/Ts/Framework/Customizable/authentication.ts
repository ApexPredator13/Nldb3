import { User, UserManager, UserManagerSettings, InMemoryWebStorage, WebStorageStateStore } from 'oidc-client';
import { removeHashAndQuerystring, getHashFromUrl } from '../browser';
import { getConfig } from './config.development';

const getUserManager = (): UserManager => {
    if ((window as any).userManager) {
        return (window as any).userManager as UserManager;
    }

    const config = getConfig();
    const baseUrlOfThisWebsite = config.baseUrlWithoutTrailingSlash;

    const settings: UserManagerSettings = {
        authority: baseUrlOfThisWebsite,
        client_id: 'local-javascript-app',
        redirect_uri: baseUrlOfThisWebsite,
        silent_redirect_uri: `${baseUrlOfThisWebsite}/SilentSignin`,
        automaticSilentRenew: true,
        monitorSession: true,
        checkSessionInterval: 10,
        response_type: 'code',
        scope: 'openid profile role',
        loadUserInfo: true,
        post_logout_redirect_uri: baseUrlOfThisWebsite,
        revokeAccessTokenOnSignout: true,
        userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() })
    };

    var userManager = new UserManager(settings);
    (window as any).userManager = userManager;
    return (window as any).userManager;
}

const getUser = async (): Promise<User | null> => {
    const userManager = getUserManager();
    let user: User | null = null;

    if (getHashFromUrl() === 'logout') {
        removeHashAndQuerystring();
        await userManager.removeUser();
        return null;
    }

    try {
        if (window.location.href.indexOf('?code=') !== -1) {
            user = await userManager.signinRedirectCallback()
            if (user) {
                removeHashAndQuerystring();
                return user;
            }
        }

        user = await userManager.getUser();
        if (user) {
            return user;
        }

        user = await userManager.signinSilent();
        if (user === null) {
            await userManager.removeUser();
        }

        return user;
    } catch {
        return null;
    }
}

const signin = () => {
    const userManager = getUserManager();
    userManager.signinRedirect();
}

const signout = () => {
    const userManager = getUserManager();
    userManager.signoutRedirect();
}

const isAdmin = (user: User) => {
    const roleClaimName = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    if (user.profile[roleClaimName] === 'admin') {
        return true;
    }
    return false;
}

const loadAdminPages = (): Promise<unknown> => {
    return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = '/js/dist/all_admin_pages.min.js';
        document.head.appendChild(script);
        script.onload = () => resolve();
    });
}

export {
    getUser,
    signin,
    signout,
    isAdmin,
    loadAdminPages
}