import { getCsrfToken } from "./Customizable/authentication";
import { modal } from "./renderer";
import { notLoggedIn } from "../Components/General/modal-contents";

async function createHeaders(body, includeCsrf = false) {
    if (!body && !includeCsrf) {
        return undefined;
    }

    const headers = new Headers();

    if (body && typeof (body) === 'string') {
        headers.set('Content-Type', 'application/json');
    }

    if (includeCsrf) {
        const csrfToken = await getCsrfToken();
        if (csrfToken) {
            headers.set('RequestVerificationToken', csrfToken);
        }
    }

    return headers;
}


async function request(url, requestInit, displayError = true) {
    try {
        const response = await fetch(url, { credentials: 'same-origin', ...requestInit });

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
    return fetch(url, { credentials: 'same-origin', ...requestInit });
}


async function get(url, authorized = false, displayError = true) {
    const headers = await createHeaders(undefined, false);
    return request(url, { method: 'GET', headers: headers }, displayError);
}

async function getResponse(url, authorized = false) {
    const headers = await createHeaders(undefined, false);
    return requestResponse(url, { method: 'GET', headers: headers });
}

async function post(url, body, authorized = false, displayError = true) {
    const headers = await createHeaders(body, true);
    return request(url, { method: 'POST', headers: headers, body: body }, displayError);
}

async function postResponse(url, body, authorized = false) {
    const headers = await createHeaders(body, true);
    return requestResponse(url, { method: 'POST', headers: headers, body: body });
}

async function del(url, authorized = false, displayError = true) {
    const headers = await createHeaders(undefined, true);
    return request(url, { method: 'DELETE', headers: headers }, displayError);
}

async function deleteResponse(url, authorized = false) {
    const headers = await createHeaders(undefined, true);
    return requestResponse(url, { method: 'DELETE', headers: headers });
}


export {
    get,
    getResponse,
    post,
    postResponse,
    del,
    deleteResponse,
    createHeaders
}
