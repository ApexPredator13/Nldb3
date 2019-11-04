async function request<T>(url: string, requestInit?: RequestInit): Promise<T> {
    const response = await fetch(url, requestInit);
    return response.json() as Promise<T>;
}

async function get<T>(url: string): Promise<T> {
    return request<T>(url, { credentials: 'same-origin' });
}

async function post<T>(url: string): Promise<T> {
    return request<T>(url, { method: 'POST', credentials: 'same-origin' });
}

export {
    get,
    post
}

