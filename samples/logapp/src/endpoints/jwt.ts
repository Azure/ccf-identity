// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as ccfapp from "@microsoft/ccf-app";

interface JwtResponse {
    token: string;
}

interface ErrorResponse {
    msg: string;
}

export function jwt(request: ccfapp.Request): ccfapp.Response<JwtResponse | ErrorResponse> {
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
        return unauthorized("Authorization header missing");
    }

    const parts = authHeader.split(" ", 2);
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return unauthorized("Unexpected authentication type");
    }

    const token = parts[1];

    return { body: { token: token } };
}

function unauthorized(msg: string): ccfapp.Response<ErrorResponse> {
    return { statusCode: 401, body: { msg: msg } };
}