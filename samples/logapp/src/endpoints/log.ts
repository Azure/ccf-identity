// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as ccfapp from "@microsoft/ccf-app";
import { checkAccess } from "@microsoft/ccf-identity";

interface LogItem {
    msg: string;
}

interface LogEntry extends LogItem {
    id: number;
}

const logMap = ccfapp.typedKv("log", ccfapp.uint32, ccfapp.json<LogItem>());

export function getLogItem(request: ccfapp.Request): ccfapp.Response<LogItem> | ccfapp.Response {
    // @ts-ignore
    if (!checkAccess(request)) {
        return { statusCode: 403 };
    }

    const id = parseInt(request.query.split("=")[1]);
    if (!logMap.has(id)) {
        return { statusCode: 404 };
    }
    return { body: logMap.get(id) };
}

export function setLogItem(request: ccfapp.Request<LogItem>): ccfapp.Response {
    const id = parseInt(request.query.split("=")[1]);
    logMap.set(id, request.body.json());
    return {};
}

export function getAllLogItems(request: ccfapp.Request): ccfapp.Response<Array<LogItem>> {
    let items: Array<LogEntry> = [];
    logMap.forEach(function (item, id) {
        items.push({ id: id, msg: item.msg });
    });
    return { body: items };
}