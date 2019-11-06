import { getUser } from "./authentication";

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

async function post<T>(url: string, authorized: boolean = false): Promise<T> {
    const headers = authorized ? await createAuthHeader() : undefined;
    return request<T>(url, { method: 'POST', headers: headers });
}


export {
    get,
    post
}

