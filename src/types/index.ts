export type DefenseMode = 'scorched_earth' | 'ghost_redirect' | 'gas_trap';

export interface CompromisedWallet {
  address: string;
  chain_id: number;
  balance: string;
  status: 'active' | 'compromised' | 'under_defense' | 'inactive';
  defense_mode?: DefenseMode;
  last_activity: Date;
}

export interface ActivityLog {
  id: string;
  wallet_address: string;
  timestamp: Date;
  action: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
