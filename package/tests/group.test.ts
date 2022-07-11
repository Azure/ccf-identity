// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect } from 'chai';
import '@microsoft/ccf-app/polyfill.js';
import * as ccfapp from '@microsoft/ccf-app';
import { getGroup, groupExists } from '../src/group';
import { GroupResponse } from "../src/models/groupResponse";
import { IdentityResponse } from "../src/models/identityResponse";

describe("Group tests", () => {
    let groupMap = ccfapp.typedKv("public:ccf.gov.groups", ccfapp.string, ccfapp.string);

    before(() => {
        groupMap.set("group1", "group1value");
    });

    after(() => {
        if (groupMap.has("group1")) {
            groupMap.delete("group1");
        }
    });

    it("Should return success for a group that has been proposed", () => {
        const result = getGroup("group1");
        expect((result as GroupResponse).name).to.equal("group1value");
    });

    it("Should fail to get a group that has not been proposed", () => {
        const result = getGroup("group2");
        expect((result as IdentityResponse).message).to.equal("Group id has not be proposed.");
    });

    it("Should return success for checking if a group exists", () => {
        const result = groupExists("group1");
        expect(result).to.equal(true);
    });

    it("Should return success for a checking for a principal that does not exist", () => {
        const result = groupExists("group2");
        expect(result).to.equal(false);
    });
});