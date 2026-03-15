const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'walletcorpse.db');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'walletcorpse_secret_32bytes_key!!';

const db = new Database(DB_PATH);

// Tables banao
db.exec(`
  CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compromised_address TEXT UNIQUE NOT NULL,
    safe_address TEXT NOT NULL,
    encrypted_private_key TEXT,
    is_active INTEGER DEFAULT 1,
    defense_mode TEXT DEFAULT 'ghost_redirect',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    last_rescue_at INTEGER,
    total_rescued TEXT DEFAULT '0',
    rescue_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compromised_address TEXT NOT NULL,
    event_type TEXT NOT NULL,
    amount TEXT,
    token_symbol TEXT,
    tx_hash TEXT,
    status TEXT DEFAULT 'success',
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
`);

function encrypt(text) {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Wallet save karo
function saveWallet(compromisedAddress, safeAddress, privateKey) {
  const encryptedKey = encrypt(privateKey);
  const stmt = db.prepare(`
    INSERT INTO wallets (compromised_address, safe_address, encrypted_private_key)
    VALUES (?, ?, ?)
    ON CONFLICT(compromised_address) 
    DO UPDATE SET 
      safe_address = excluded.safe_address,
      encrypted_private_key = excluded.encrypted_private_key,
      is_active = 1
  `);
  stmt.run(
    compromisedAddress.toLowerCase(),
    safeAddress.toLowerCase(),
    encryptedKey
  );
  console.log(`💾 Wallet saved to DB: ${compromisedAddress.slice(0,10)}...`);
}

// Wallet load karo
function getWallet(compromisedAddress) {
  const stmt = db.prepare('SELECT * FROM wallets WHERE compromised_address = ? AND is_active = 1');
  const row = stmt.get(compromisedAddress.toLowerCase());
  if (!row) return null;
  return {
    compromisedAddress: row.compromised_address,
    safeAddress: row.safe_address,
    privateKey: row.encrypted_private_key ? decrypt(row.encrypted_private_key) : null,
    defenseMode: row.defense_mode,
    rescueCount: row.rescue_count,
    totalRescued: row.total_rescued,
  };
}

// All active wallets load karo
function getAllActiveWallets() {
  const stmt = db.prepare('SELECT * FROM wallets WHERE is_active = 1');
  return stmt.all().map(row => ({
    compromisedAddress: row.compromised_address,
    safeAddress: row.safe_address,
    privateKey: row.encrypted_private_key ? decrypt(row.encrypted_private_key) : null,
    defenseMode: row.defense_mode,
  }));
}

// Rescue log karo
function logActivity(compromisedAddress, eventType, amount, tokenSymbol, txHash, status) {
  const stmt = db.prepare(`
    INSERT INTO activity_log (compromised_address, event_type, amount, token_symbol, tx_hash, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    compromisedAddress.toLowerCase(),
    eventType,
    amount || '0',
    tokenSymbol || 'ETH',
    txHash || '',
    status || 'success'
  );
}

// Update rescue stats
function updateRescueStats(compromisedAddress, amount) {
  const stmt = db.prepare(`
    UPDATE wallets 
    SET rescue_count = rescue_count + 1,
        last_rescue_at = strftime('%s', 'now'),
        total_rescued = CAST(CAST(total_rescued AS REAL) + ? AS TEXT)
    WHERE compromised_address = ?
  `);
  stmt.run(amount, compromisedAddress.toLowerCase());
}

// Deactivate wallet
function deactivateWallet(compromisedAddress) {
  const stmt = db.prepare('UPDATE wallets SET is_active = 0 WHERE compromised_address = ?');
  stmt.run(compromisedAddress.toLowerCase());
}

// Activity log fetch
function getActivityLog(compromisedAddress, limit = 50) {
  const stmt = db.prepare(`
    SELECT * FROM activity_log 
    WHERE compromised_address = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `);
  return stmt.all(compromisedAddress.toLowerCase(), limit);
}

// Defense mode update
function updateDefenseMode(compromisedAddress, mode) {
  const stmt = db.prepare('UPDATE wallets SET defense_mode = ? WHERE compromised_address = ?');
  stmt.run(mode, compromisedAddress.toLowerCase());
}

module.exports = {
  saveWallet,
  getWallet,
  getAllActiveWallets,
  logActivity,
  updateRescueStats,
  deactivateWallet,
  getActivityLog,
  updateDefenseMode,
};
