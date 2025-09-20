/**
 * Fee Distributor
 * Handles distribution of claimed fees to multiple recipients
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { DistributeRequest, DistributeResponse } from './types';

export class FeeDistributor {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Distribute SOL to multiple recipients
   */
  async distribute(
    payer: Keypair,
    request: DistributeRequest
  ): Promise<DistributeResponse> {
    try {
      const signatures: string[] = [];
      let totalDistributed = 0;

      // Create transactions for each recipient
      for (const recipient of request.recipients) {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: new PublicKey(recipient.address),
            lamports: recipient.amount * LAMPORTS_PER_SOL,
          })
        );

        // Send transaction
        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [payer],
          {
            commitment: 'confirmed',
          }
        );

        signatures.push(signature);
        totalDistributed += recipient.amount;
      }

      return {
        success: true,
        signatures,
        totalDistributed
      };

    } catch (error) {
      return {
        success: false,
        error: `Distribution failed: ${error.message}`
      };
    }
  }

  /**
   * Validate recipient addresses
   */
  validateRecipients(recipients: Array<{ address: string; amount: number }>): boolean {
    try {
      for (const recipient of recipients) {
        new PublicKey(recipient.address);
        if (recipient.amount <= 0) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate total distribution amount
   */
  calculateTotal(recipients: Array<{ address: string; amount: number }>): number {
    return recipients.reduce((total, recipient) => total + recipient.amount, 0);
  }
}