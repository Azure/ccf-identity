#!/bin/bash
# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

/opt/ccf/bin/scurl.sh https://127.0.0.1:8000/gov/proposals --cacert /workspace/sandbox_common/networkcert.pem --signing-cert /workspace/sandbox_common/member0_cert.pem --signing-key /workspace/sandbox_common/member0_privk.pem -X POST -H "Content-Type: application/json" --data-binary @set_group_proposal.json