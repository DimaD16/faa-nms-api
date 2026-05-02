export type NmsEnvironment = "production" | "staging" | "fit";

export interface NmsClientOptions {
    clientId: string;
    clientSecret: string;
    environment?: NmsEnvironment;
}

export interface NmsSearchParams {
    [key: string]: string | number | boolean | undefined;
}

// ---- OpenAPI Schema Types ---- //

export type NmsResponseFormat = "AIXM" | "GEOJSON";

export type NotamClassification = "INTERNATIONAL" | "MILITARY" | "LOCAL_MILITARY" | "DOMESTIC" | "FDC";

export type NotamFeature = "RWY" | "TWY" | "APRON" | "AD" | "OBST" | "NAV" | "COM" | "SVC" | "AIRSPACE" | "ODP" | "SID" | "STAR" | "CHART" | "DATA" | "DVA" | "IAP" | "VFP" | "ROUTE" | "SPECIAL" | "SECURITY";

export interface NmsInternalError {
    code: string;
    message: string;
}

export interface NmsResponse {
    status: string;
    errors?: NmsInternalError[];
}

export interface NmsLocationSeriesData {
    locationSeries?: Record<string, any>[];
}

export interface NmsLocationSeriesResponse extends NmsResponse {
    data: NmsLocationSeriesData;
}

export interface NmsNotamData {
    aixm?: string[];
    geojson?: Record<string, any>[];
    url?: string;
}

export interface NmsNotamResponse extends NmsResponse {
    data: NmsNotamData;
}

export interface NmsInitialLoadData {
    url?: string;
}

export interface NmsInitialLoadResponse extends NmsResponse {
    data: NmsInitialLoadData;
}

export interface NmsChecklistDataItem {
    id?: string;
    classification?: NotamClassification;
    accountId?: string;
    number?: string;
    location?: string;
    icaoLocation?: string;
    lastUpdated?: string;
}

export interface NmsChecklistData {
    checklist?: NmsChecklistDataItem[];
}

export interface NmsChecklistResponse extends NmsResponse {
    data: NmsChecklistData;
}

export interface NmsError {
    timestamp: string;
    status: string;
    message: string;
}
