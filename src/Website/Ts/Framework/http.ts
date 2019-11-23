import { getUser } from "./Customizable/authentication";
import { ComponentWithModal } from "./ComponentBaseClasses/component-with-modal";
import { GenericError } from "../Components/Modal/generic-error";


async function createAuthHeader(): Promise<Headers | undefined> {
    const user = await getUser();
    if (user) {
        const headers = new Headers();
        headers.append('Authorization', `${user.token_type} ${user.access_token}`);
        return headers;
    }
    return undefined;
}


async function request<T>(url: string, requestInit?: RequestInit, displayError = true): Promise<T | null> {
    try {
        const response = await fetch(url, requestInit);

        if (!response.ok) {
            if (displayError) {
                const errorMessage = await response.text();
                new ComponentWithModal().ShowModal(new GenericError(errorMessage));
            }
            return null;
        }

        return response.json() as Promise<T>;
    } catch (e) {
        if (displayError) {
            new ComponentWithModal().ShowModal(new GenericError('You are either offline or the server is dead.'));
        }
        return null;
    }
}

async function requestResponse(url: string, requestInit?: RequestInit): Promise<Response> {
    return fetch(url, requestInit);
}



async function get<T>(url: string, authorized = false, displayError = true): Promise<T | null> {
    const headers = authorized ? await createAuthHeader() : undefined;
    return request<T>(url, { method: 'GET', headers: headers }, displayError);
}

async function getResponse(url: string, authorized = false): Promise<Response> {
    const headers = authorized ? await createAuthHeader() : undefined;
    return requestResponse(url, { method: 'GET', headers: headers });
}

async function post<T>(url: string, body?: FormData | string, authorized = false, displayError = true): Promise<T | null> {
    const headers = authorized ? await createAuthHeader() : undefined;
    return request<T>(url, { method: 'POST', headers: headers, body: body }, displayError);
}

async function postResponse(url: string, body?: FormData | string, authorized = false): Promise<Response> {
    const headers = authorized ? await createAuthHeader() : undefined;
    return requestResponse(url, { method: 'POST', headers: headers, body: body });
}


export {
    get,
    getResponse,
    post,
    postResponse
}

