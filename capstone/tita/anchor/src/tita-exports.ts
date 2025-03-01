// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import TitaProgramIDL from '../target/idl/tita_program.json'
import type { TitaProgram } from '../target/types/tita_program'

// Re-export the generated IDL and type
export { TitaProgram, TitaProgramIDL }

// The programId is imported from the program IDL.
export const TITA_PROGRAM_ID = new PublicKey(TitaProgramIDL.address)

// This is a helper function to get the Basic Anchor program.
export function getTitaProgram(provider: AnchorProvider) {
  return new Program(TitaProgramIDL as TitaProgram, provider)
}