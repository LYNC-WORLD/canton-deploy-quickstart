// One project, three networks. Switch with --network.
const app = {
  parties: ['Alice', 'Bob'],
  excludePackages: ['./asset-tests'],
};

// DevNet / TestNet profiles are added only when <PREFIX>_HOST is set,
// so LocalNet works with no .env. The user id must match your JWT's `sub`.
const remote = (name, prefix, extra = {}) => {
  const host = process.env[`${prefix}_HOST`];
  if (!host) return {};
  const userId = process.env[`${prefix}_USER_ID`];
  return {
    [name]: {
      ...app,
      host,
      ledgerPort: Number(process.env[`${prefix}_LEDGER_PORT`] || 5001),
      httpPort: Number(process.env[`${prefix}_HTTP_PORT`] || 7575),
      uploadVia: 'ledger',
      token: process.env[`${prefix}_JWT_TOKEN`],
      scriptUserId: userId,
      users: [{ userId, parties: ['Alice', 'Bob'], rights: ['CanActAs', 'CanReadAs'] }],
      ...extra,
    },
  };
};

module.exports = {
  defaultNetwork: 'localnet',
  networks: {
    localnet: {
      ...app,
      host: 'localhost',
      adminPort: 5002,
      ledgerPort: 5001,
      httpPort: 7575,
      users: [{
        userId: 'ledger-api-user',
        parties: ['Alice', 'Bob'],
        rights: ['CanActAs', 'CanReadAs'],
      }],
    },
    ...remote('devnet', 'DEVNET', { vetOnUpload: true }),
    // Demo convenience so the setup script runs straight after upload.
    // In production keep vetOnUpload false and run `vet` after review.
    ...remote('testnet', 'TESTNET', { vetOnUpload: true }),
  },
};