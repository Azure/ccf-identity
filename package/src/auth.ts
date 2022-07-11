// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * The `auth` module provides information of individual or group authorization to access a CCF endpoint
 *
 * @module
 */

import * as ccfapp from "@microsoft/ccf-app";
import jwt_decode from "jwt-decode";
import { getRole, getRolesForPrincipal } from "./rbac";
import { Permission } from "./models/permission";
import { IRoleDefinition } from "./models/roleDefinition";
import { ErrorResponse } from "./models/errorResponse";
import { getRolesForGroups } from "./rbac";

interface JwtPayload {
    oid?: string;
    group_ids: string[];
}

/**
 * Checks whether user or group has access to a given endpoint
 * 
 * @param request The request object from CCF.
 * @returns
 */

export function checkAccess(request: ccfapp.Request): boolean | ErrorResponse {
    const authHeader = request.headers["authorization"];
    const authParts = authHeader.split(" ", 2);
    const decodedToken = jwt_decode<JwtPayload>(authParts[1]);
    const resource = request.path;

    let spRoles;
    let gpRoles;

    decodedToken?.oid !== undefined ? spRoles = getRolesForPrincipal(decodedToken?.oid) : undefined;
    decodedToken?.group_ids !== undefined && decodedToken?.group_ids.length > 0 ? gpRoles = getRolesForGroups(decodedToken?.group_ids) : undefined;

    let denied: boolean = false;
    let allowed: boolean = false;

    if (spRoles) {
        spRoles.some(role => {
            let irole: IRoleDefinition = getRole(role) as IRoleDefinition;
            let perm: Permission = irole.permissions;

            if (perm.notActions !== undefined) {
                let dresult = perm.notActions.some(el => {
                    return el === resource;
                });
                if (dresult) {
                    denied = true;
                    return;
                }
            }
        });

        if (denied) return false;

        spRoles.some(role => {
            let irole: IRoleDefinition = getRole(role) as IRoleDefinition;
            let perm: Permission = irole.permissions;

            if (perm.actions !== undefined) {
                let aresult = perm.actions.some(el => {
                    return el === resource;
                });
                if (aresult) {
                    allowed = true;
                    return;
                }
            }
        });
    }

    if (gpRoles) {
        gpRoles.some(role => {
            let irole: IRoleDefinition = getRole(role) as IRoleDefinition;
            let perm: Permission = irole.permissions;

            if (perm.notActions !== undefined) {
                let dresult = perm.notActions.some(el => {
                    return el === resource;
                });
                if (dresult) {
                    denied = true;
                    return;
                }
            }
        });

        gpRoles.some(role => {
            let irole: IRoleDefinition = getRole(role) as IRoleDefinition;
            let perm: Permission = irole.permissions;

            if (perm.actions !== undefined) {
                let aresult = perm.actions.some(el => {
                    return el === resource;
                });
                if (aresult) {
                    allowed = true;
                    return;
                }
            }
        });
    }
    return allowed;
}