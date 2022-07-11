// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect } from 'chai';
import '@microsoft/ccf-app/polyfill.js';
import { ActionType, addAction, removeAction, addRole, isInRole, assignPrincipalToRole, getRolesForPrincipal, getPermissionsForRole, removePrincipalFromRole, getRole, removeRole, updateRole, roleExists, getRolesForGroups } from "../src/rbac";
import { IRoleDefinition } from "../src/models/roleDefinition";
import { IdentityResponse } from '../src/models/identityResponse';
import { Permission } from '../src/models/permission';
import * as ccfapp from '@microsoft/ccf-app';

describe("Role based access tests", () => {
    let role: IRoleDefinition;
    let rougeRole: IRoleDefinition;
    let principalMap = ccfapp.typedKv("public:ccf.gov.service_principals", ccfapp.string, ccfapp.string);

    before(() => {
        role = JSON.parse('{"id":"id1", "name":"name1"}');
        rougeRole = JSON.parse('{"id":"id99", "name":"name99"}');
        role.permissions = {
            actions: [],
            notActions: []
        };
        principalMap.set("690222be-ff1a-4d56-abd1-7e4f7d38e474", "prin1");
    });

    after(() => {
        if (roleExists(role.id)) {
            removeRole(role.id);
        }

        removePrincipalFromRole("id1", "690222be-ff1a-4d56-abd1-7e4f7d38e474");

        if (principalMap.has("690222be-ff1a-4d56-abd1-7e4f7d38e474")) {
            principalMap.delete("690222be-ff1a-4d56-abd1-7e4f7d38e474");
        }
    });

    it("Should return true if new role created", () => {
        let result: IdentityResponse = addRole(role);
        expect(result.message).to.equal("Role created successfully.");
    });

    it("Should get a newly created role", () => {
        const result: IRoleDefinition | IdentityResponse = getRole(role.id);
        expect((result as IRoleDefinition).id).to.equal(role.id);
    });

    it("Should not allow adding the same existing role", () => {
        let result: IdentityResponse = addRole(role);
        expect(result.message).to.equal("Creation of role failed, role already exists.");
    });

    it("Should allow updating a role", () => {
        let result = updateRole(role);
        expect(result.message).to.equal("Role updated successfully.");
    });

    it("Should pass to return permissions for role", () => {
        let result = getPermissionsForRole(role.id);
        expect(result as Permission);
    });

    it("Should fail to return permissions for role that doesn't exist", () => {
        let result = getPermissionsForRole(rougeRole.id);
        expect((result as IdentityResponse).message).to.equal("No permissions found in role.");
    });

    it("Should fail to update a role that does not exist", () => {
        let result = updateRole(rougeRole);
        expect(result.message).to.equal("Role does not exist and cannot be updated.");
    });

    it("Should confirm existing role exists", () => {
        let result = roleExists(role.id);
        expect(result).to.equal(true);
    });

    it("Should confirm role that does not exist does not exist.", () => {
        let result = roleExists(rougeRole.id);
        expect(result).to.equal(false);
    });

    it("Should pass to assign a principal to a role that does exist", () => {
        const roleResult = addRole(role);
        const result = assignPrincipalToRole("id1", "690222be-ff1a-4d56-abd1-7e4f7d38e474");
        expect((result as IdentityResponse).message).to.equal("Role assigned successfully");
    });

    it("Should confirm that principal assigned to role is in role", () => {
        const result = isInRole("id1", "690222be-ff1a-4d56-abd1-7e4f7d38e474");
        expect(result).to.equal(true);
    });

    it("Should pass to return roles for principal", () => {
        const result = getRolesForPrincipal("690222be-ff1a-4d56-abd1-7e4f7d38e474");
        expect(result as string[]);
        ///TODO: fix this count issue
        expect((result as string[]).length).to.equal(3);
    });

    it("Should fail to return roles for principal that doesn't exist", () => {
        const result = getRolesForPrincipal("prin2");
        expect(result).to.equal(undefined);
    });

    it("Should pass to remove a principal from a role that it is assigned to", () => {
        const result = removePrincipalFromRole("id1", "690222be-ff1a-4d56-abd1-7e4f7d38e474");
        expect((result as IdentityResponse).message).to.equal("Role assignment removed");
    });

    it("Should confirm that principal not assigned to role is not in role", () => {
        const result = isInRole("id1", "690222be-ff1a-4d56-abd1-7e4f7d38e474");
        expect(result).to.equal(false);
    });

    it("Should fail to remove a principal from a role that doesn't exist", () => {
        const result = removePrincipalFromRole("id98", "690222be-ff1a-4d56-abd1-7e4f7d38e474");
        expect((result as IdentityResponse).message).to.equal("Role removal failed, role id passed does not exist.");
    });

    it("Should fail to remove a principal that does not exist from a role", () => {
        const result = removePrincipalFromRole("id1", "prin2");
        expect((result as IdentityResponse).message).to.equal("Role removal failed, principal id passed does not exist.");
    });

    it("Should pass to add a new allowed action to an existing role with no permissions", () => {
        const actionResult = addAction(role.id, "/log/get", ActionType.Allowed);
        expect(actionResult.message).to.equal("Action successfully added to allowed permissions");
    });

    it("Should fail to add an allowed action to an existing role which already contains that action", () => {
        const actionResult = addAction(role.id, "/log/get", ActionType.Allowed);
        const permissions = getPermissionsForRole(role.id)
        expect(actionResult.message).to.equal("Action is already defined in the allowed permissions.");
    });

    it("Should fail to add an action from a role that does not exist", () => {
        const actionResult = addAction(rougeRole.id, "/log/get", ActionType.Allowed);
        expect(actionResult.message).to.equal("Role does not exist");
    });

    it("Should pass to remove an allowed action from an existing role containing that action", () => {
        const actionResult = removeAction(role.id, "/log/get", ActionType.Allowed);
        expect(actionResult.message).to.equal("Action successfully removed from allowed permissions");
    });

    it("Should pass to add a new deny action to an existing role", () => {
        const actionResult = addAction(role.id, "/log/put", ActionType.Denied);
        const permissions = getPermissionsForRole(role.id)
        expect(actionResult.message).to.equal("Action successfully added to denied permissions");
    });

    it("Should fail to add an deny action to an existing role which already contains that action", () => {
        const actionResult = addAction(role.id, "/log/put", ActionType.Denied);
        expect(actionResult.message).to.equal("Action is already defined in the denied permissions.");
    });

    it("Should pass to remove a denied action from an existing role containing that action", () => {
        const actionResult = removeAction(role.id, "/log/put", ActionType.Denied);
        expect(actionResult.message).to.equal("Action successfully removed from denied permissions");
    });

    it("Should fail to remove an action from a role that does not exist", () => {
        const actionResult = removeAction(rougeRole.id, "/log/put", ActionType.Allowed);
        expect(actionResult.message).to.equal("Role does not exist");
    });

    it("Should remove a role", () => {
        let result: IdentityResponse = removeRole(role.id);
        expect(result.message).to.equal("Role removed successfully.");
    });

    it("Should fail to remove a role that does not exist", () => {
        let result: IdentityResponse = removeRole(rougeRole.id);
        expect(result.message).to.equal("Role does not exist and cannot be deleted.");
    });

    it("Should fail to get a role that does not exist", () => {
        const result: IRoleDefinition | IdentityResponse = getRole(role.id);
        expect((result as IdentityResponse).message).to.equal("Role id passed does not exist.");
    });

    it("Should fail to assign a principal to a role that doesn't exist", () => {
        const result = assignPrincipalToRole("id3", "prin1");
        expect((result as IdentityResponse).message).to.equal("Role assignment failed, role id passed does not exist.");
    });

    it("Should fail to assign a principal that doesn't exist to a role", () => {
        const roleResult = addRole(role);
        const result = assignPrincipalToRole("id1", "prin2");
        expect((result as IdentityResponse).message).to.equal("Role assignment failed, principal id passed does not exist.");
    });

    it("Should pass to return roles for groups", () => {
        addRole(role);
        assignPrincipalToRole("id1", "690222be-ff1a-4d56-abd1-7e4f7d38e474");

        const result = getRolesForGroups(["690222be-ff1a-4d56-abd1-7e4f7d38e474"]);
        expect((result as string[])[0]).to.equal('id1');
    });

    it("Should fail to return roles for group principal that doesn't exist", () => {
        const result = getRolesForGroups(["prin2"]);
        expect(result).to.equal(undefined);
    });
});