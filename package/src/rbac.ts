// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * The `rbac` module provides methods for managing individual or group role-based access control to a CCF network
 *
 * @module
 */

import * as ccfapp from "@microsoft/ccf-app";
import { IdentityResponse } from "./models/identityResponse";
import { IRoleDefinition } from "./models/roleDefinition";
import { Permission } from "./models/permission";
import { RoleAssignment } from "./models/roleAssignment";
import { principalExists } from "./principal";

let roles = ccfapp.typedKv("roles", ccfapp.string, ccfapp.json<IRoleDefinition>());
let roleAssignments = ccfapp.typedKv("roleassignments", ccfapp.string, ccfapp.json<RoleAssignment>());

export enum ActionType {
    Allowed,
    Denied
}

/**
 * Adds a new role
 * 
 * @param role  The role definition that should be created.
 *              {"id":"1", "name":"role1", "permissions": { "actions": [ "/app/log" ] } }
 * 
 * @returns 
 */
export function addRole(role: IRoleDefinition): IdentityResponse {
    if (roles.has(role.id)) {
        return { message: "Creation of role failed, role already exists." };
    }

    roles.set(role.id, role);
    return { message: "Role created successfully." };
}

/**
 * Removes existing role
 * 
 * @param roleId The role id to remove.
 * @returns 
 */
export function removeRole(roleId: string): IdentityResponse {
    if (roles.has(roleId)) {
        roles.delete(roleId);
        return { message: "Role removed successfully." };
    }
    return { message: "Role does not exist and cannot be deleted." };
}

/**
 * Updates existing role with a new role definition
 * 
 * @param role The role definition that should be updated.
 *              {"id":"1", "name":"role1", "permissions": { "actions": [ "/app/log" ] } }
 * @returns 
 */
export function updateRole(role: IRoleDefinition): IdentityResponse {
    if (roles.has(role.id)) {
        roles.set(role.id, role);
        return { message: "Role updated successfully." };
    }
    return { message: "Role does not exist and cannot be updated." };
}

/**
 * Gets existing role details
 * 
 * @param roleId The role id to retrieve.
 * @returns 
 */
export function getRole(roleId: string): IRoleDefinition | IdentityResponse {
    if (roles.has(roleId)) {
        const role = roles.get(roleId);
        if (role !== undefined) {
            return role;
        }
    }
    return { message: "Role id passed does not exist." };
}

/**
 * Checks whether role exists
 * 
 * @param roleId The role id to lookup.
 * @returns 
 */
export function roleExists(roleId: string): boolean {
    if (roles.has(roleId)) {
        return true;
    }
    return false;
}

/**
 * Assigns principal to an existing role
 * 
 * @param roleId The role id to lookup.
 * @param principalId The service principal to add to the role.
 * @returns 
 */
export function assignPrincipalToRole(roleId: string, principalId: string): IdentityResponse {
    if (roleExists(roleId) && principalExists(principalId)) {
        if (!roleAssignments.has(principalId)) {
            roleAssignments.set(principalId, JSON.parse(`{"roles": [ "${roleId}" ]}`));
        } else {
            let assignment = roleAssignments.get(principalId);
            if (assignment !== undefined) {
                assignment?.roles.push(roleId);
                roleAssignments.set(principalId, assignment);
            }
        }
        return { message: "Role assigned successfully" };
    } else {
        if (!roleExists(roleId)) {
            return { message: "Role assignment failed, role id passed does not exist." };
        } else if (!principalExists(principalId)) {
            return { message: "Role assignment failed, principal id passed does not exist." };
        }
    }
    return { message: "Role assignment failed" };
}

/**
 * Removes principal from an existing role
 * 
 * @param roleId The role id to lookup.
 * @param principalId The service principal to remove from the role.
 * @returns 
 */
export function removePrincipalFromRole(roleId: string, principalId: string): IdentityResponse {
    if (roleExists(roleId) && principalExists(principalId)) {
        if (roleAssignments.has(principalId)) {
            roleAssignments.delete(principalId);
            return { message: "Role assignment removed" };
        }
    }
    else {
        if (!roleExists(roleId)) {
            return { message: "Role removal failed, role id passed does not exist." };
        } else if (!principalExists(principalId)) {
            return { message: "Role removal failed, principal id passed does not exist." };
        }
    }
    return { message: "Role removal failed" };
}

/**
 * Checks whether principal has a given role
 * 
 * @param roleId The role id to lookup.
 * @param principalId The service principal to check for to the role.
 * @returns 
 */
export function isInRole(roleId: string, principalId: string): boolean {
    if (roles.has(roleId)) {
        let assignment = roleAssignments.get(principalId);
        if (assignment !== undefined) {
            return true;
        }
    }
    return false;
}

/**
 * Gets permissions for a given role
 * 
 * @param roleId The role id to lookup.
 * @returns 
 */
export function getPermissionsForRole(roleId: string): Permission | IdentityResponse {
    if (roleExists(roleId)) {
        let role = roles.get(roleId);
        if (role?.permissions !== undefined) {
            return role.permissions;
        }
    }
    return { message: "No permissions found in role." };
}

/**
 * Gets assigned roles for a principal
 * 
 * @param principal_id The service principal id to lookup.
 * @returns 
 */
export function getRolesForPrincipal(principal_id: string): string[] | undefined {
    if (roleAssignments.has(principal_id)) {
        let assignment = roleAssignments.get(principal_id);
        if (assignment?.roles !== undefined) {
            return assignment.roles;
        }
    }
    return undefined;
}

/**
 * Gets assigned roles for a group
 * 
 * @param group_ids The group id to lookup.
 * @returns 
 */
export function getRolesForGroups(group_ids: string[]): string[] | undefined {
    const roles: RoleAssignment[] = new Array<RoleAssignment>();
    const rroles: string[] = new Array();

    group_ids.forEach(group_id => {
        if (roleAssignments.has(group_id)) {
            let assignment = roleAssignments.get(group_id);
            if (assignment?.roles !== undefined) {
                roles.push(assignment);
            }
        }
    });

    if (roles.length > 0) {
        roles.forEach(role => {
            role.roles.forEach(irole => {
                rroles.push(irole);
            });
        });
        return rroles;
    }
    return undefined;
}

/**
 * Adds new action to an existing role
 * 
 * @param role_id The role id to lookup.
 * @param action The action to add to the role, this is the relative uri: e.g. '/app/log'
 * @param actionType 
 * @returns 
 */
export function addAction(role_id: string, action: string, actionType: ActionType): IdentityResponse {
    let exists: boolean = false;
    if (roleExists(role_id)) {
        let role = getRole(role_id);
        if (role as IRoleDefinition) {
            let rd = role as IRoleDefinition;
            if (actionType === ActionType.Allowed) {
                if (rd.permissions) {
                    let sresult = rd.permissions.actions.some((element) => {
                        return element === action;
                    });
                    if (sresult) {
                        return { message: "Action is already defined in the allowed permissions." };
                    }
                } else {
                    rd.permissions = { actions: [], notActions: [] };
                }

                if (rd.permissions.actions) {
                    rd.permissions.actions.push(action);
                } else {
                    rd.permissions.actions = new Array<string>(action);
                }
                updateRole(rd);
                return { message: "Action successfully added to allowed permissions" };
            } else if (actionType === ActionType.Denied) {
                if (rd.permissions) {
                    let sresult = rd.permissions.notActions.some((element) => {
                        return element === action;
                    });
                    if (sresult) {
                        return { message: "Action is already defined in the denied permissions." };
                    }
                } else {
                    rd.permissions = { actions: [], notActions: [] };
                }

                if (rd.permissions.actions) {
                    rd.permissions.notActions.push(action);
                } else {
                    rd.permissions.notActions = new Array<string>(action);
                }
                updateRole(rd);
                return { message: "Action successfully added to denied permissions" };
            } else {
                return { message: "Action type invalid." };
            }
        }
        return { message: "Role returned is invalid" };
    }
    return { message: "Role does not exist" };
}

/**
 * Removes action from an existing role
 * 
 * @param role_id The role id to lookup.
 * @param action The action to remove from the role, this is the relative uri: e.g. '/app/log'
 * @param actionType 
 * @returns 
 */
export function removeAction(role_id: string, action: string, actionType: ActionType): IdentityResponse {
    if (roleExists(role_id)) {
        let role = getRole(role_id);
        if (role as IRoleDefinition) {
            let rd = role as IRoleDefinition;
            if (actionType === ActionType.Allowed) {
                rd.permissions.actions = rd.permissions.actions.filter(ac => ac === action);
                updateRole(rd);
                return { message: "Action successfully removed from allowed permissions" };
            } else if (actionType === ActionType.Denied) {
                rd.permissions.notActions = rd.permissions.notActions.filter(nac => nac === action);
                updateRole(rd);
                return { message: "Action successfully removed from denied permissions" };
            } else {
                return { message: "Action type invalid." };
            }
        }
        return { message: "Role returned is invalid" };
    }
    return { message: "Role does not exist" };
}