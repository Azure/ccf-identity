// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * The `group` module provides information about membership of a group in a CCF network
 *
 * @module
 */

import * as ccfapp from "@microsoft/ccf-app";
import { GroupResponse } from "./models/groupResponse";
import { IdentityResponse } from "./models/identityResponse";

let groupMap = ccfapp.typedKv("public:ccf.gov.groups", ccfapp.string, ccfapp.string);

/**
 * Gets group details
 * 
 * @param group_id The group id to lookup.
 * @returns 
 */
export function getGroup(group_id: string): GroupResponse | IdentityResponse {
    if (groupMap.has(group_id)) {
        const result = groupMap.get(group_id);
        if (result !== undefined) {
            return { id: group_id, name: result };
        }
    }
    return { message: "Group id has not be proposed." };
}

/**
 * Checks whether group exists
 * 
 * @param group_id The group id to lookup.
 * @returns
 */
export function groupExists(group_id: string): boolean {
    if (groupMap.has(group_id)) {
        return true;
    }
    return false;
}
