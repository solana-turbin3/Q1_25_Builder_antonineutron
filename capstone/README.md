# Tita - Decentralized Grant Management Platform

> Solana Turbine Program Capstone Project

A blockchain-based solution for transparent and efficient grant management, built on Solana.

## Problem Statement
Traditional grant management systems lack transparency, have high administrative overhead, and slow fund distribution. Tita solves these challenges through smart contracts and blockchain technology.

## Core Features

### For Grant Providers
- Create and manage grant campaigns
- Review and approve/reject proposals
- Validate milestone completions
- Automated fund distribution

### For Grant Recipients
- Browse available grants
- Submit proposals
- Track milestone progress
- Submit proof of completion
- Receive automatic payments

## Technical Architecture 

- **Backend**: Solana Program (Using Anchor)
  - Grant Campaign Management
  - Proposal Processing
  - Milestone Tracking
  - Automated Payments

- **Frontend**: Next.js Web Application
  - Wallet Integration
  - Campaign Dashboard
  - Proposal Management
  - Milestone Evidence Upload

## Getting Started

### Prerequisites
- Node v18.18.0 or higher
- Rust v1.77.2 or higher
- Anchor CLI 0.30.1 or higher
- Solana CLI 1.18.17 or higher

### Installation
```shell
git clone <repo-url>
cd tita
npm install
  ```
### Start local validator
 ```shell
solana-test-validator
 ```

### Deploy program
```shell
anchor build
anchor deploy
```

### Start web app
```shell
npm run dev
```
### About
This project is part of the Solana Turbine Program, focusing on building real-world applications on Solana blockchain.

### Contact
Antoni - antonineutron@gmail.com

### License
MIT