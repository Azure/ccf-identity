#!/bin/bash
# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

scurl.sh https://127.0.0.1:8000/gov/proposals --cacert /workspace/sandbox_common/service_cert.pem --signing-cert /workspace/sandbox_common/member0_cert.pem --signing-key /workspace/sandbox_common/member0_privk.pem -X POST -H "Content-Type: application/json" --data-binary @ca_cert_proposal.json
scurl.sh https://127.0.0.1:8000/gov/proposals --cacert /workspace/sandbox_common/service_cert.pem --signing-cert /workspace/sandbox_common/member0_cert.pem --signing-key /workspace/sandbox_common/member0_privk.pem -X POST -H "Content-Type: application/json" --data-binary @jwt_issuer_proposal.json
scurl.sh https://127.0.0.1:8000/gov/proposals --cacert /workspace/sandbox_common/service_cert.pem --signing-cert /workspace/sandbox_common/member0_cert.pem --signing-key /workspace/sandbox_common/member0_privk.pem -X POST -H "Content-Type: application/json" --data-binary @set_service_principal_proposal.json

curl https://127.0.0.1:8000/app/roles --cacert /workspace/sandbox_common/service_cert.pem --cert /workspace/sandbox_common/user0_cert.pem --key /workspace/sandbox_common/user0_privk.pem -i -X POST -H "Content-Type: application/json" --data '{"id":"role1", "name":"role1", "permissions": { "actions": [ "/app/log" ] } }'
curl https://127.0.0.1:8000/app/roleAssignments --cacert /workspace/sandbox_common/service_cert.pem --cert /workspace/sandbox_common/user0_cert.pem --key /workspace/sandbox_common/user0_privk.pem -i -X POST -H "Content-Type: application/json" --data '{"roleId":"role1", "principalId":"<your oid>"}'

curl https://127.0.0.1:8000/app/log?id=1 --cacert /workspace/sandbox_common/service_cert.pem --cert /workspace/sandbox_common/user0_cert.pem --key /workspace/sandbox_common/user0_privk.pem -i -X GET -H "Authorization: Bearer "
