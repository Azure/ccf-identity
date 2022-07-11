// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * 
 * Example :
 *  ```
 *  let role: IRoleDefinition = JSON.parse('{"id":"roleID", "name":"roleName"}');
 *  ```
 * @module
 */

import { Permission } from './permission';

export interface IRoleDefinition {
    id: string;
    name: string;
    permissions: Permission;
}