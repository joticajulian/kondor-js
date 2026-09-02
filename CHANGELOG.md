# Changelog

All notable changes to this project will be documented in this file. 🤘

## [v1.3.0](https://github.com/joticajulian/kondor-js/releases/tag/v1.3.0) (2026-09-02)

### 🚀 Features

- sendTransaction now gets the provider from the options. Thanks to this, it is not required to define a provider for the KondorSigner instance. It will get it from the contract class. Note: This is to define the provider for the wait function of the transaction. The provider that actually sends the transaction is independent and defined in the Kondor App.

## [v1.2.1](https://github.com/joticajulian/kondor-js/releases/tag/v1.2.1) (2025-02-15)

### 🚀 Features

- new KondorSigner class
- getSigner works as a KondorSigner class, then it's possible to update the provider

## [v1.1.0](https://github.com/joticajulian/kondor-js/releases/tag/v1.1.0) (2024-04-25)

### 🚀 Features

- Support new functions of Provider in koilib v7
- The koilib dependency has been moved to dev dependency
- Minor updates in the documentation

## [v1.0.0](https://github.com/joticajulian/kondor-js/releases/tag/v1.0.0) (2024-04-19)

### 🚀 Features

- Using koilib v6
- prepareTransaction was removed from the signer to be aligned with koilib v6. This change also removes the providerPrepareTransaction introduced in v0.3.4 to prevent the double popup. Since prepareTransaction is not part anymore of the signer class the double popup issue is solved.

## [v0.4.3](https://github.com/joticajulian/kondor-js/releases/tag/v0.4.3) (2023-07-29)

### 🚀 Features

- Bump libraries (koilib v5.6.1)

## [v0.4.2](https://github.com/joticajulian/kondor-js/releases/tag/v0.4.2) (2023-05-02)

### 🐛 Bug Fixes

- fix type getAccounts
- fix network in wait function

## [v0.4.1](https://github.com/joticajulian/kondor-js/releases/tag/v0.4.1) (2023-04-21)

### 🐛 Bug Fixes

- fix package.json

## [v0.4.0](https://github.com/joticajulian/kondor-js/releases/tag/v0.4.0) (2023-04-02)

### 🚀 Features

- sign message is now available
- getProvider function to be able to select the network
- include kondor version in the calls

## [v0.3.4](https://github.com/joticajulian/kondor-js/releases/tag/v0.3.4) (2022-12-24)

### 🚀 Features

- Introduction of providerPrepareTransaction in the options to fix the issue with double popups
