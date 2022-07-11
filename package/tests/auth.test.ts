// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import '@microsoft/ccf-app/polyfill.js';
import * as ccfapp from '@microsoft/ccf-app';
import { expect } from 'chai';
import { Request } from '@microsoft/ccf-app/endpoints';
import { IRoleDefinition } from "../src/models/roleDefinition";
import { addRole, checkAccess, assignPrincipalToRole, addAction, ActionType, getRole, getRolesForPrincipal, getPrincipal, roleExists, removeRole, removePrincipalFromRole } from "../src";

describe("Authentication tests", () => {
    let request: Request;
    let request2: Request;
    let role: IRoleDefinition;
    let role2: IRoleDefinition;
    let principalMap = ccfapp.typedKv("public:ccf.gov.service_principals", ccfapp.string, ccfapp.string);
    const authToken: string = 'Bearer: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imk2bEdrM0ZaenhSY1ViMkMzbkVRN3N5SEpsWSJ9.eyJhdWQiOiI2ZTc0MTcyYi1iZTU2LTQ4NDMtOWZmNC1lNjZhMzliYjEyZTMiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3YyLjAiLCJpYXQiOjE1MzcyMzEwNDgsIm5iZiI6MTUzNzIzMTA0OCwiZXhwIjoxNTM3MjM0OTQ4LCJhaW8iOiJBWFFBaS84SUFBQUF0QWFaTG8zQ2hNaWY2S09udHRSQjdlQnE0L0RjY1F6amNKR3hQWXkvQzNqRGFOR3hYZDZ3TklJVkdSZ2hOUm53SjFsT2NBbk5aY2p2a295ckZ4Q3R0djMzMTQwUmlvT0ZKNGJDQ0dWdW9DYWcxdU9UVDIyMjIyZ0h3TFBZUS91Zjc5UVgrMEtJaWpkcm1wNjlSY3R6bVE9PSIsImF6cCI6IjZlNzQxNzJiLWJlNTYtNDg0My05ZmY0LWU2NmEzOWJiMTJlMyIsImF6cGFjciI6IjAiLCJuYW1lIjoiQWJlIExpbmNvbG4iLCJvaWQiOiI2OTAyMjJiZS1mZjFhLTRkNTYtYWJkMS03ZTRmN2QzOGU0NzQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhYmVsaUBtaWNyb3NvZnQuY29tIiwicmgiOiJJIiwic2NwIjoiYWNjZXNzX2FzX3VzZXIiLCJzdWIiOiJIS1pwZmFIeVdhZGVPb3VZbGl0anJJLUtmZlRtMjIyWDVyclYzeERxZktRIiwidGlkIjoiNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3IiwidXRpIjoiZnFpQnFYTFBqMGVRYTgyUy1JWUZBQSIsInZlciI6IjIuMCJ9.pj4N-w_3Us9DrBLfpCt';

    before(() => {
        role = JSON.parse('{"id":"id1", "name":"name1"}');
        role2 = JSON.parse('{"id":"id2", "name":"name2"}');
        addRole(role);
        addRole(role2);
        principalMap.set("690222be-ff1a-4d56-abd1-7e4f7d38e474", "prin1",);
        assignPrincipalToRole("id1", "690222be-ff1a-4d56-abd1-7e4f7d38e474");
        assignPrincipalToRole("id2", "690222be-ff1a-4d56-abd1-7e4f7d38e474");
        addAction("id1", "/test/path", ActionType.Allowed);
        addAction("id1", "/test1/path", ActionType.Allowed);
        addAction("id2", "/test1/path", ActionType.Denied);
        request = JSON.parse(`{"headers": {"authorization":"${authToken}"}, "path": "/test/path"}`);
        request2 = JSON.parse(`{"headers": {"authorization":"${authToken}"}, "path": "/test1/path"}`);
    });

    after(() => {
        if (roleExists(role.id)) {
            removeRole(role.id);
        }

        principalMap.delete("690222be-ff1a-4d56-abd1-7e4f7d38e474");
        removePrincipalFromRole("id1", "690222be-ff1a-4d56-abd1-7e4f7d38e474");
    });

    it("Should pass if a path exists in the request", () => {
        const result = checkAccess(request);
        expect(result).to.equal(true);
    });

    it("Should fail as deny permissions are enabled", () => {
        const result = checkAccess(request2);
        expect(result).to.equal(false);
    });
});