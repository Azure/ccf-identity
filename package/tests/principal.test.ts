// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect } from 'chai';
import '@microsoft/ccf-app/polyfill.js';
import * as ccfapp from '@microsoft/ccf-app';
import { getPrincipal, principalExists } from '../src/principal';
import { PrincipalResponse } from "../src/models/principalResponse";
import { IdentityResponse } from "../src/models/identityResponse";

describe("Principal tests", () => {
    let principalMap = ccfapp.typedKv("public:ccf.gov.service_principals", ccfapp.string, ccfapp.string);

    before(() => {
        principalMap.set("690222be-ff1a-4d56-abd1-7e4f7d38e474", "prin1");
    });

    after(() => {
        if (principalMap.has("690222be-ff1a-4d56-abd1-7e4f7d38e474")) {
            principalMap.delete("690222be-ff1a-4d56-abd1-7e4f7d38e474");
        }
    });

    it("Should return success for a principal that has been proposed", () => {
        const result = getPrincipal("690222be-ff1a-4d56-abd1-7e4f7d38e474");
        expect((result as PrincipalResponse).name).to.equal("prin1");
    });

    it("Should fail to get a principal that has not been proposed", () => {
        const result = getPrincipal("prin2");
        expect((result as IdentityResponse).message).to.equal("Principal id has not be proposed.");
    });

    it("Should return success for checking if a principal exists", () => {
        const result = principalExists("690222be-ff1a-4d56-abd1-7e4f7d38e474");
        expect(result).to.equal(true);
    });

    it("Should return success for a checking for a principal that does not exist", () => {
        const result = principalExists("prin2");
        expect(result).to.equal(false);
    })
});