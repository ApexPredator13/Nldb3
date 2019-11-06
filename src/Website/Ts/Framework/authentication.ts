import { User, UserManager, UserManagerSettings } from 'oidc-client';
import { removeHashAndQuerystring, getHashFromUrl } from './browser';

const getUserManager = (): UserManager => {
    if ((window as any).userManager) {
        return (window as any).userManager as UserManager;
    }

    const baseUrlOfThisWebsite = 'https://localhost:5005';

    const settings: UserManagerSettings = {
        authority: baseUrlOfThisWebsite,
        client_id: 'local-javascript-app',
        redirect_uri: baseUrlOfThisWebsite,
        silent_redirect_uri: `${baseUrlOfThisWebsite}/SilentSignin`,
        automaticSilentRenew: true,
        monitorSession: true,
        checkSessionInterval: 10,
        response_type: 'code',
        scope: 'openid profile',
        loadUserInfo: true,
        post_logout_redirect_uri: baseUrlOfThisWebsite,
        revokeAccessTokenOnSignout: true
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
            console.log('(authentication) checking redirect callback...');
            user = await userManager.signinRedirectCallback()
            if (user) {
                console.warn('(authentication) user found in redirect callback');
                removeHashAndQuerystring();
                return user;
            }
        }

        console.log('(authentication) checking session state...');
        user = await userManager.getUser();
        if (user) {
            console.warn('(authentication) user found in session storage');
            return user;
        }


        console.log('(authentication) checking silent signin...');
        user = await userManager.signinSilent();
        if (user === null) {
            console.warn('(authentication) user not found, deleting user.');
            await userManager.removeUser();
        }

        console.warn('(authentication) user found in silent signin');
        return user;
    } catch(e) {
        console.error('(authentication) get user failed!', e)
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

export {
    getUser,
    signin,
    signout
}