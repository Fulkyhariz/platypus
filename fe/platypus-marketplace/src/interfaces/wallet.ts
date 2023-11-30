export interface IWallet {
  wallet_id: number;
  user_data: number;
  balance: number;
}

export interface IWalletHistory {
  id: number;
  wallet_id: number;
  recipient_id: number;
  sender_id: number;
  amount: string;
  description: string;
}
