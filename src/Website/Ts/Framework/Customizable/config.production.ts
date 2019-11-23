import { Config } from "./config";

const getConfig = (): Config => {
    const config: Config = {
        baseUrlWithoutTrailingSlash: 'https://www.northernlion-db.com'
    };
    return config;
}

export {
    getConfig
}