<div align="center">
  <h1>✈️ FAA NMS API Client</h1>
  <p><strong>A fully typed, robust, and zero-dependency Node.js/TypeScript client for the Federal Aviation Administration (FAA) NOTAM Management System (NMS) API.</strong></p>
  
  [![npm version](https://img.shields.io/npm/v/faa-nms-api.svg?style=flat-square)](https://www.npmjs.com/package/faa-nms-api)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
</div>

---

## 🌟 Why this package?

Interacting with the FAA NMS API traditionally requires manual OAuth 2.0 `client_credentials` token management, complex URL parameters handling, and dealing with undocumented type structures.

This library handles **all the heavy lifting**:
- 🚀 **Zero Dependencies**: Built entirely on top of native Node.js `fetch`.
- 🔒 **Smart Authentication**: Fully automatic and lazy token refreshing. Never worry about expired Bearer tokens.
- 🏷️ **100% Typed**: Strict TypeScript mappings directly derived from the official FAA OpenAPI specification.
- 🌍 **Multi-Environment Support**: Switch between `production`, `staging`, and `fit` effortlessly.

## 📑 Table of Contents
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Client Configuration](#-client-configuration)
- [API Reference](#-api-reference)
  - [getFilteredNotams()](#1-getfilterednotams)
  - [getNotamsChecklist()](#2-getnotamschecklist)
  - [getLocationSeries()](#3-getlocationseries)
  - [getInitialLoad()](#4-getinitialload)
  - [getInitialLoadByClassification()](#5-getinitialloadbyclassification)
  - [getContent()](#6-getcontent)
- [Exported Types](#-exported-types)
- [Error Handling](#-error-handling)
- [License](#-license)

---

## 📦 Installation

Install the package via your favorite package manager. *(Requires Node.js 18+ for native fetch support)*.

```bash
npm install faa-nms-api
# or
yarn add faa-nms-api
# or
pnpm add faa-nms-api
```

---

## 🚀 Quick Start

Here is a minimal example of how to fetch NOTAMs for a specific airport in GeoJSON format.

```typescript
import { NmsClient } from 'faa-nms-api';

// 1. Initialize the client
const faaClient = new NmsClient({
    clientId: process.env.FAA_CLIENT_ID!,
    clientSecret: process.env.FAA_CLIENT_SECRET!,
    environment: 'production'
});

// 2. Fetch data (Tokens are generated automatically in the background)
async function run() {
    try {
        const response = await faaClient.getFilteredNotams('GEOJSON', {
            location: 'JFK',
            radius: 50
        });

        console.log(`Found ${response.data.geojson?.length} NOTAMs.`);
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

run();
```

---

## ⚙️ Client Configuration

When instantiating the `NmsClient`, you must pass an `NmsClientOptions` object:

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `clientId` | `string` | **Yes** | - | Your FAA NMS API Client ID. |
| `clientSecret` | `string` | **Yes** | - | Your FAA NMS API Client Secret. |
| `environment` | `'production' \| 'staging' \| 'fit'` | No | `'production'` | Target FAA Environment. |

---

## 📖 API Reference

All methods are asynchronous and return Promises containing exact TypeScript interfaces mapping to the FAA OpenAPI spec.

### 1. `getFilteredNotams`
Search NOTAMs with advanced filters.

```typescript
function getFilteredNotams(
    nmsResponseFormat: 'AIXM' | 'GEOJSON', 
    params?: NmsSearchParams
): Promise<NmsNotamResponse | NmsInitialLoadResponse>
```

**Optional Parameters (`params`):**
- `location` (e.g., `'DFW'`, `'KDFW'`)
- `classification` (`'DOMESTIC'`, `'INTERNATIONAL'`, `'FDC'`, `'MILITARY'`, `'LOCAL_MILITARY'`)
- `feature` (`'RWY'`, `'TWY'`, `'APRON'`, `'AIRSPACE'`, etc.)
- `nmsId` (Exact 16-digit NOTAM ID)
- `radius`, `latitude`, `longitude` (Must be used together)
- `accountability`, `effectiveStartDate`, `effectiveEndDate`, `lastUpdatedDate`, `freeText`, `notamNumber`

### 2. `getNotamsChecklist`
Fetch lightweight NOTAM checklists (used for quick diffs).

```typescript
function getNotamsChecklist(params?: {
    accountability?: string;
    classification?: NotamClassification;
    location?: string;
}): Promise<NmsChecklistResponse>
```

### 3. `getLocationSeries`
Retrieve Location-Series data, useful to see what changed since a specific date.

```typescript
function getLocationSeries(params?: { 
    lastUpdatedDate?: string 
}): Promise<NmsLocationSeriesResponse>
```

### 4. `getInitialLoad`
Retrieve a temporary URL to download a highly compressed dump of **all** active NOTAMs across the NAS.

```typescript
function getInitialLoad(params?: { 
    allowRedirect?: boolean 
}): Promise<NmsInitialLoadResponse | Response>
```

### 5. `getInitialLoadByClassification`
Retrieve a compressed global load, filtered by a specific classification.

```typescript
function getInitialLoadByClassification(
    classification: NotamClassification, 
    params?: { allowRedirect?: boolean }
): Promise<NmsInitialLoadResponse | Response>
```

### 6. `getContent`
Proxies access to download binary content files (streams) returned by the Initial Load endpoints.

```typescript
function getContent(token: string): Promise<Response>
```

---

## 🧩 Exported Types

The package exports all TypeScript interfaces directly from the FAA specification. You can import them to strongly type your own application:

```typescript
import type { 
    NmsNotamResponse, 
    NotamClassification, 
    NotamFeature,
    NmsEnvironment
} from 'faa-nms-api';

const myClass: NotamClassification = 'DOMESTIC';
```

---

## 🛡️ Error Handling

If the FAA API rejects the request (e.g., invalid parameters, unauthorized, or server outages), the client throws a native JavaScript `Error`. You should catch these in your application.

```typescript
try {
    await faaClient.getFilteredNotams('GEOJSON', { radius: -5 }); // Invalid!
} catch (error) {
    if (error instanceof Error) {
        console.error('FAA API Error:', error.message);
        // "NMS API request failed: 400 Bad Request - {"timestamp": "...", "status": "400", "message": "Bad Request"}"
    }
}
```

---

## 📜 License

This project is licensed under the MIT License.
