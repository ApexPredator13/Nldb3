import { getUser } from "./Customizable/authentication";

async function createAuthHeader(): Promise<Headers | undefined> {
    const user = await getUser();
    if (user) {
        const headers = new Headers();
        headers.append('Authorization', `${user.token_type} ${user.access_token}`);
        return headers;
    }
    return undefined;
}

async function request<T>(url: string, requestInit?: RequestInit): Promise<T> {
    const response = await fetch(url, requestInit);
    return response.json() as Promise<T>;
}

async function get<T>(url: string, authorized: boolean = false): Promise<T> {
    const headers = authorized ? await createAuthHeader() : undefined;
    return request<T>(url, { method: 'GET', headers: headers });
}

async function post<T>(url: string, body?: FormData, authorized: boolean = false): Promise<T> {
    const headers = authorized ? await createAuthHeader() : undefined;
    return request<T>(url, { method: 'POST', headers: headers, body: body });
}

async function getResponse(url: string, authorized: boolean = false): Promise<Response> {
    const headers = authorized ? await createAuthHeader() : undefined;
    return await fetch(url, { method: 'GET', headers: headers });
}

async function postResponse(url: string, body?: FormData, authorized: boolean = false): Promise<Response> {
    const headers = authorized ? await createAuthHeader() : undefined;
    return await fetch(url, { method: 'POST', headers: headers, body: body });
}

export {
    get,
    post,
    getResponse,
    postResponse
}

