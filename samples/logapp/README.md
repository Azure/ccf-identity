# Introduction

The application contained in this folder is for the work to enable Azure Active Directory via OAuth with CCF. The work is to use the JWT to authenticate users without certificates needed. Additionally providing granular RBAC (role-based access control) of the endpoints for the application is included, using claims inside the JWT.

## Getting Started

The quickest way to get started with this application is the create a development environment. After getting the initial environment setup, some other details will need to be added to support this application authentication.

1. Create a VM in Azure (DC if you want the real enclave or regular if you want to use the sandbox)

2. Install docker on the VM.

   a. Copy the script content from [here](scripts/installDocker.sh) into a file named `installDocker.sh`.

   b. Grant execute access to this script: `sudo chmod +x installDocker.sh`

   c. Execute the script: `./installDocker.sh`

   d. Give the current user access to docker:

   ```
   sudo gpasswd -a $USER docker
   newgrp docker
   ```

3. Install the docker image for CCF (v2.0.0-rc0) and start in interactive mode.

   ```
   docker run -it --name ccf mcr.microsoft.com/ccf/app/dev:2.0.0-sgx bash
   ```

4. Install VI for dev editing capabilities.

   ```
   sudo apt-get update
   sudo apt-get install vim -y
   ```

5. Clone the official CCF repo to home directory.

   ```
   cd $HOME
   git clone https://github.com/Microsoft/CCF
   ```

6. Start the default javascript based JWT example application.

   ```
   cd /
   /opt/ccf/bin/sandbox.sh --js-app-bundle $HOME/CCF/tests/js-authentication
   ```

7. Open another terminal window and attached interactively to the docker container.

   ```
   docker exec -it ccf bash
   ```

8. Validate that CCF instance is healthy

   ```
   curl -X GET https://127.0.0.1:8000/app/commit --cacert /workspace/sandbox_common/service_cert.pem --cert /workspace/sandbox_common/user0_cert.pem --key /workspace/sandbox_common/user0_privk.pem -i
   ```

   ```
   NOTE: The result should be:
      HTTP/1.1 200 OK
      content-length: 25
      content-type: application/json
      x-ms-ccf-transaction-id: 2.10

      {"transaction_id":"2.10"}
   ```

9. Now to get started with the AAD app, cloning the repo from GitHub is required. This contains a sample application is included [here](samples/logapp).

   ```
   cd $HOME/
   git clone https://github.com/Azure/ccf-identity
   ```

10. Next the application will need to be _built_. Primarily this is packaging the resulting javascript from the typescript and bundling in a way that CCF will accept for execution. To get started NodeJS will need to be installed.

    ```
    cd $HOME
    wget https://nodejs.org/dist/v16.15.0/node-v16.15.0-linux-x64.tar.xz
    mkdir /usr/local/lib/nodejs
    tar -xJvf node-v16.15.0-linux-x64.tar.xz -C /usr/local/lib/nodejs
    export PATH=$PATH:/usr/local/lib/nodejs/node-v16.15.0-linux-x64/bin
    ```

11. Following the NodeJS installation, the packages for the typescript application will need to be installed.

    ```
    cd $HOME/ccf-identity/
    cd samples/logapp
    npm install
    ```

12. After the package installation, the bundling for CCF will need to be done. The resulting CCF application will reside in `$HOME/ccf-identity/samples/logapp/dist/`

    ```
    npm run build
    ```

13. Copy the constitution script to the startup for CCF.

    ```
    cp $HOME/ccf-identity/samples/logapp/constitution/actions.js /opt/ccf/bin
    ```

14. With all the configuration and assets in place, and the application built and bundled, the CCF host service can be started. This is started by running the following commands on the CCF development server:

    ```
    cd /
    /opt/ccf/bin/sandbox.sh --js-app-bundle $HOME/ccf-identity/samples/logapp/dist
    ```

15. With the CCF host service and application running, now a few proposals need to be issued and accepted in order for the application to use them. This starts with starting another terminal window and attaching to the docker container running CCF. After this run the following commands:

    ```
    sudo chmod +x $HOME/ccf-identity/samples/logapp/assets/ccf_proposal_bootstrap.sh
    cd /opt/ccf/bin
    $HOME/ccf-identity/samples/logapp/assets/ccf_proposal_bootstrap.sh
    ```

16. Next, proposals of some initial group and service principals will be required for RBAC operations. Some pre-created proposals are available in the assets folder.

    - Group Proposal [here](assets/set_group_proposal.json)

    - Service Principal Proposal [here](assets/set_service_principal_proposal.json)

    To apply these proposals, a few scripts have been created.

    - Group - [here](assets/set_group.sh)

    - Service Principals - [here](assets/set_service_principal.sh)

17. After these have been applied the new functionality can be tested, by creating roles, role assignments and testing these.

    - **Create a new role** - curl https://127.0.0.1:8000/app/roles --cacert /workspace/sandbox_common/networkcert.pem --cert /workspace/sandbox_common/user0_cert.pem --key /workspace/sandbox_common/user0_privk.pem -i -X POST -H "Content-Type: application/json" --data '{"id":"role1","name":"role1name"}'

    - **Create a new role assignment** - curl https://127.0.0.1:8000/app/roleAssignments --cacert /workspace/sandbox_common/networkcert.pem --cert /workspace/sandbox_common/user0_cert.pem --key /workspace/sandbox_common/user0_privk.pem -i -X POST -H "Content-Type: application/json" --data '{"roleId":"role1","principalId":"sp1"}'

    - **Check the role/principal mapping** - curl "https://127.0.0.1:8000/app/checkRole?roleId=role1&principalId=sp1" --cacert /workspace/sandbox_common/networkcert.pem --cert /workspace/sandbox_common/user0_cert.pem --key /workspace/sandbox_common/user0_privk.pem -i -X GET
