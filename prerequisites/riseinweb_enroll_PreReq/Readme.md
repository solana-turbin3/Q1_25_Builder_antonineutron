TX Link:
https://explorer.solana.com/tx/gkRirbinWVFvaxG1nqgMaBaiUskytSYTYNaHL5qLm8Gc6GDsTTmNb34HCXW5FdBSbnZG5maooukwKKhhHskA5KC?cluster=devnet

# Bridge to Turbin3 Project Submission  

This project demonstrates key concepts in Solana development, including:  
- Creating a wallet using `Keygen`.  
- Programmatically airdropping SOL to the wallet.  
- Transferring SOL between wallets.  
- Interacting with on-chain programs.  

### Files Overview  
1. **`transfer.ts`**:  
   - Responsible for creating a wallet.  

2. **`airdrop.ts`**:  
   - Handles programmatic SOL airdrops to the created wallet.  

3. **`transfer.ts`**:  
   - Demonstrates SOL transfer from one wallet (`dev-wallet.json`) to another (`wallet2.json`).  

4. **`enroll.ts`**:  
   - Facilitates interaction with the contract deployed at `WBA52hW35HZU5R2swG57oehbN2fTr7nNhNDgfjnqUoZ`.  
   - This interaction involves submitting my GitHub username to the contract.  
   - The transaction from the interaction is on the first line above

5. **`programs/`**:  
   - Contains the IDL (Interface Definition Language) files for interacting with the blockchain program.  


## Notes  
- Install `yarn` to use this project.  
- Use `yarn <filename>` to execute the respective files.  
