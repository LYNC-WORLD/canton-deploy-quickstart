# Deploy your first Daml package to Canton in 5 minutes

This repo is a small Daml project setup up with [canton-deploy](https://docs.lync.world/docs/CANTON/deploy/canton-deploy). 

We will run a local Canton participant, deploy the project with one command, and see contracts on the ledger. The same project then deploys to DevNet or TestNet by changing one flag.

The project has two packages. `asset` holds an `Asset` template and a `Setup` script that issues a token to Alice and transfers it to Bob. `asset-tests` holds tests; it is built but never uploaded, because the config excludes it.

The full walkthrough, with expected output for every step, is in the [5-Minute Quickstart](https://docs.lync.world/docs/CANTON/deploy/feat/quickstart) guide.

## Before we start

We need DPM 1.0.20 or later (it bundles Daml SDK 3.5) and Node.js 18 or later.

## 1. Install

```bash
git clone https://github.com/LYNC-WORLD/canton-deploy-quickstart
cd canton-deploy-quickstart
dpm install package
dpm canton-deploy --help
```

`dpm install package` installs everything listed under `components:` in `multi-package.yaml`: the compiler, Daml Script, a local Canton sandbox, and canton-deploy. On first install DPM pins canton-deploy by digest and rewrites that line. Leave it in place.

## 2. Start a local participant

In a separate terminal:

```bash
dpm sandbox --ledger-api-port 5001 --admin-api-port 5002 --json-api-port 7575
```

Wait for `Canton sandbox is ready.` and leave it running. If it fails with `Failed to bind to address /127.0.0.1:6868`, another sandbox is already running; stop it or use that one.

## 3. Deploy (2 minutes)

```bash
dpm canton-deploy status --network localnet
dpm canton-deploy deploy --network localnet --script Setup:setup
```

`status` confirms the Ledger, JSON and Admin APIs are reachable. `deploy` then builds both packages, drops `asset-tests`, uploads and vets the `asset` DAR, allocates Alice and Bob, creates `ledger-api-user` with rights to act as both, and runs the setup script. On LocalNet it signs its own development token, so there is nothing to configure.

## 4. Check the ledger

```bash
dpm canton-deploy parties --network localnet --local
dpm canton-deploy packages --network localnet
dpm canton-deploy contracts --network localnet --template '#asset:Asset:Asset'
```

We will see one `Asset` owned by Bob. That is the whole loop: build, upload, onboard, seed, verify. (Each extra `deploy --script` run against the same sandbox adds one more.)

## Going to DevNet or TestNet

Nothing in the project changes. Copy `.env.example` to `.env`, fill in our validator's host, ports, a JWT and the user id from its `sub` claim, then:

```bash
set -a; source .env; set +a
dpm canton-deploy status --network devnet
dpm canton-deploy deploy --network devnet --script Setup:setup
```

For TestNet, use `--network testnet`. Remote profiles upload through the Ledger API, so the Admin API does not need to be exposed. If your validator sits behind Splice's nginx proxy or on a remote host, see [Remote Validators](https://docs.lync.world/docs/CANTON/deploy/feat/remote-validators).

The TestNet profile sets `vetOnUpload: true` so the demo runs in one step. For production, keep it `false`, deploy, review, then run `dpm canton-deploy vet --network testnet`.

## Why Alice and Bob are looked up, not allocated

`deploy` allocates the names in the config's `parties` list before the script runs. If the script also called `allocatePartyByHint "Alice"`, Canton would reject the duplicate. So `Setup.daml` finds the parties with `listKnownParties`. Give each party name one owner: the config or the script, never both.

## Next steps

Read the full [canton-deploy docs](https://docs.lync.world/docs/CANTON/deploy/canton-deploy) for CI with pre-built DARs, MainNet with `tokenCommand` and TLS, and multi-synchronizer participants.

---

canton-deploy is built by [LYNC](https://lync.world) with support from the [Canton Foundation](https://canton.foundation/). Licensed under [Apache 2.0](LICENSE).
