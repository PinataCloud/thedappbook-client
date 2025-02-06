## thedappbook - Client

![cover](https://dweb.mypinata.cloud/ipfs/bafkreih24voz7rvhcugw66ulsl7lpmk7sekq2s52anuezuaykb7qt4swo4)

A simple blockchain application using smart contracts and IPFS

## Overview

thedappbook allows users to connect their wallet and write posts on the decentralized wall. This happens through several components:

- Smart Contracts - Works like a decentralized database that stores the messages and the address of the user who posted them. Blockchain data is too expensive to store full res images, so instead it stores an IPFS CID that points to the content offchain.
- Server - Handles generating temporary Pinata API Keys to upload images and JSON content that can be consumed by the client.
- Client - The hosted web UI that the end user connects their wallet with and writes a message to the smart contract.

## The Client

This particular repo handles the client interactivity. The overal flow of the data and UX is as follows:
- User connects their wallet
- User writes a message in the text box and selects an image to upload
- Form is submitted
  - The client will make a request for a temproary API key from the Server
  - API key is used to upload the image first, and then uploads a JSON file with the message and the image reference
  - Upload of the JSON file returns a CID
- User is prompted with a transaction in their wallet to write the previously return JSON CID to the smart contract. Since it is a write action it requires some eth to pay gas fees.
- If the transaction is successful it will reload the posts and fetch the latest posts from the contract

## Development

Clone the repo and install the dependencies

```bash
git clone https://github.com/PinataCloud/thedappbook-client
cd thedappbook-client
npm install
```

Once the dependencies are installed start up the dev server

```bash
npm run dev
```

Please reference the structure below to get a feel where things are
```
src
├── App.tsx // Main app and logic
├── assets
│   └── react.svg
├── index.css
├── main.tsx
├── utils
│   ├── constants.ts // Smart contract address and ABI
│   ├── pinata.ts // Pinata Uploads to IPFS
│   ├── types.ts // Types
│   └── viem.ts // Smart contract functions
└── vite-env.d.ts
```

## Questions?

Feel free to reach out over [Discord](https://discord.gg/pinata) or [Email](mailto:steve@pinata.cloud)!
