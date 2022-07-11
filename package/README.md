# CCF Identity package

This repository contains the TypeScript package that contains the identity integration for CCF, specifically to provide RBAC capabilities in CCF based applications. This allows both authentication as well as authorization with an IDP from CCF. This integration is at the CCF application level and includes both individual and group based authorization.

## Prerequisites

- [NodeJS](https://nodejs.org/) (_tested with 16.13.1 LTS_)

- AAD configuration - An AAD tenant and application is required.

## Build

To build the package:

```
npm install
npm run build
```

`NOTE: This package is written in TypeScript and in current form is not bundled as part of the build process. The process will simply create the js output in a dist/ folder.`
