import { getUser } from "./Customizable/authentication";
import { modal } from "./renderer";
import { notLoggedIn } from "../Components/General/modal-contents";

async function createHeaders(body, authorized) {
    if (!body && !authorized) {
        return undefined;
    }

    const headers = new Headers();

    if (body && typeof (body) === 'string') {
        headers.append('Content-Type', 'application/json');
    }

    if (authorized) {
        const user = await getUser();
        if (user) {
            headers.append('Authorization', `${user.token_type} ${user.access_token}`);
        }
    }

    return headers;
}


async function request(url, requestInit, displayError = true) {
    try {
        const response = await fetch(url, requestInit);

        if (response.status === 401) {
            if (displayError) {
                modal(false, notLoggedIn());
            }
            return null;
        }

        if (!response.ok) {
            if (displayError) {
                const errorMessage = await response.clone().text();
                console.error(errorMessage);
            }
            return null;
        }

        try {
            return await response.clone().json();
        } catch (e) {
            try {
                return await response.text();
            } catch (e) {
                return null;
            }
        }
    } catch (e) {
        if (displayError) {
            console.error('error');
        }
        return null;
    }
}

async function requestResponse(url, requestInit) {
    return fetch(url, requestInit);
}



async function get(url, authorized = false, displayError = true) {
    const headers = await createHeaders(undefined, authorized);
    return request(url, { method: 'GET', headers: headers }, displayError);
}

async function getResponse(url, authorized = false) {
    const headers = await createHeaders(undefined, authorized);
    return requestResponse(url, { method: 'GET', headers: headers });
}

async function post(url, body, authorized = false, displayError = true) {
    const headers = await createHeaders(body, authorized);
    return request(url, { method: 'POST', headers: headers, body: body }, displayError);
}

async function postResponse(url, body, authorized = false) {
    const headers = await createHeaders(body, authorized);
    return requestResponse(url, { method: 'POST', headers: headers, body: body });
}


export {
    get,
    getResponse,
    post,
    postResponse
}

