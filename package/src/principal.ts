// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * The `principal` module provides information about membership of an individual in a CCF network
 *
 * @module
 */

import * as ccfapp from "@microsoft/ccf-app";
import { IdentityResponse } from "./models/identityResponse";
import { PrincipalResponse } from "./models/principalResponse";

let idMap = ccfapp.typedKv("public:ccf.gov.service_principals", ccfapp.string, ccfapp.string);

/**
 * Gets principal details
 * 
 * @param principal_id 
 * @returns 
 */
export function getPrincipal(principal_id: string): PrincipalResponse | IdentityResponse {
    if (idMap.has(principal_id)) {
        const result = idMap.get(principal_id);
        if (result !== undefined) {
            return { id: principal_id, name: result };
        }
    }
    return { message: "Principal id has not be proposed." }
};

/**
 * Checks whether principal exists
 * 
 * @param principal_id 
 * @returns 
 */
export function principalExists(principal_id: string): boolean {
    if (idMap.has(principal_id)) {
        return true;
    }
    return false;
}