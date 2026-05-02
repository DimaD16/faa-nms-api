export const URLS = {
    production: {
        auth: "https://api-nms.aim.faa.gov/v1/auth/token",
        api: "https://api-nms.aim.faa.gov/nmsapi"
    },
    staging: {
        auth: "https://api-staging.cgifederal-aim.com/v1/auth/token",
        api: "https://api-staging.cgifederal-aim.com/nmsapi"
    },
    fit: {
        auth: "https://api-fit.cgifederal-aim.com/v1/auth/token",
        api: "https://api-fit.cgifederal-aim.com/nmsapi"
    }
} as const;
