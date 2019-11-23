import { Config } from "./config";

const getConfig = (): Config => {
    const config: Config = {
        baseUrlWithoutTrailingSlash: 'https://localhost:5005'
    };
    return config;
}

export {
    getConfig
}