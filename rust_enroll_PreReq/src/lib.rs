mod programs;

#[cfg(test)]
mod tests {
    use solana_sdk;
    use solana_sdk::{
        signature::{Keypair, Signer, read_keypair_file}, 
        pubkey::Pubkey, 
        transaction::Transaction, 
        message::Message
    };
    use bs58;
    use std::io::{self, BufRead};

    const RPC_URL: &str = "https://api.devnet.solana.com";
    use solana_client::rpc_client::RpcClient; 
    use solana_program::{system_instruction::transfer,system_program};
    use std::str::FromStr;
    
    use crate::programs::Turbin3_prereq::{Turbin3PrereqProgram, CompleteArgs,UpdateArgs};

    #[test]
    fn keygen() {
        let kp: Keypair = Keypair::new();

        println!("You've generated a new Solana wallet: {}", kp.pubkey().to_string()); 
        println!("");
        println!("To save your wallet, copy and paste the following into a JSON file:");

        println!("{:?}", kp.to_bytes());
    } 
    
    #[test] 
    fn airdrop() {
        let keypair = read_keypair_file("dev-wallet.json")
            .expect("Couldn't find wallet file");

        // Connect to Solana Devnet RPC Client
        let client = RpcClient::new(RPC_URL);

        // We're going to claim 2 devnet SOL tokens (2 billion lamports)
        match client.request_airdrop(&keypair.pubkey(), 2_000_000_000u64) {
            Ok(s) => {
                println!("Success! Check out your transaction here:");

                println!("https://explorer.solana.com/tx/{}?cluster=devnet", s.to_string());
            }

            Err(e) => println!("Oops, something went wrong: {}", e.to_string()) 
        };
    } 
    
    #[test] 
    fn transfer_sol() {
        // Import our keypair
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");

        // Define our Turbin3 public key
        let to_pubkey = Pubkey::from_str("9HjGNMeLTxtmyJDRzVnHKrzVH6sUsEFQKqQsD6BQpHpB").unwrap();

        let rpc_client = RpcClient::new(RPC_URL);

        let recent_blockhash = rpc_client .get_latest_blockhash() 
            .expect("Failed to get recent blockhash");

        let transaction = Transaction::new_signed_with_payer( 
            &[
                transfer(
                    &keypair.pubkey(), 
                    &to_pubkey, 
                    1_000_000
                )
            ], 
            Some(&keypair.pubkey()), 
            &vec![&keypair], 
            recent_blockhash
        );

        // Send the transaction
        let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");

        // Print our transaction out 
        println!("Success! Check out your transaction here: https://explorer.solana.com/tx/{}/?cluster=devnet",signature);
    }

    #[test]
    fn clear_wallet_balance() {
        // Import our keypair
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");

        // Define our Turbin3 public key
        let to_pubkey = Pubkey::from_str("9HjGNMeLTxtmyJDRzVnHKrzVH6sUsEFQKqQsD6BQpHpB").unwrap();

        let rpc_client = RpcClient::new(RPC_URL);

        let recent_blockhash = rpc_client.get_latest_blockhash() 
            .expect("Failed to get recent blockhash");

        // Get balance of dev wallet
        let balance = rpc_client
        .get_balance(&keypair.pubkey())
        .expect("Failed to get balance");

        // Create a test transaction to calculate fees
        let message = Message::new_with_blockhash(
            &[
                transfer( 
                    &keypair.pubkey(), 
                    &to_pubkey, 
                    balance,
                )
            ], 
            Some(&keypair.pubkey()), 
            &recent_blockhash
        );

        // Calculate exact fee rate to transfer entire SOL amount out of account minus fees 
        let fee= rpc_client.get_fee_for_message(&message) .expect("Failed to get fee calculator");

        // Deduct fee from lamports amount and create a TX with correct balance 
        let transaction = Transaction::new_signed_with_payer(
            &[
                transfer( 
                    &keypair.pubkey(), 
                    &to_pubkey, 
                    balance - fee,
                )
            ], 
            Some(&keypair.pubkey()), 
            &vec![&keypair], 
            recent_blockhash
        );

        // Send the transaction
        let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");

        // Print our transaction out 
        println!("Success! Check out your transaction here: https://explorer.solana.com/tx/{}/?cluster=devnet",signature);
    }

    #[test]
    fn complete(){
        // Create a Solana devnet connection
        let rpc_client = RpcClient::new(RPC_URL);

        let signer = read_keypair_file("wallet.json").expect("Couldn't find wallet file");

        let prereq = Turbin3PrereqProgram::derive_program_address(&[b"prereq",signer.pubkey().to_bytes().as_ref()]);

        // Define our instruction data 
        let args = CompleteArgs{github: b"antonineutron".to_vec() };

        let blockhash = rpc_client.get_latest_blockhash().expect("Failed to get recent blockhash");

        // Now we can invoke the "complete" function 
        let transaction = Turbin3PrereqProgram::complete(
            &[&signer.pubkey(), 
            &prereq, 
            &system_program::id()
        ], &args, Some(&signer.pubkey()),&[&signer],blockhash );

        let signature = rpc_client.send_and_confirm_transaction(&transaction).expect("Failed to send transaction");

        // Print our transaction out 
        println!("Success! Check out your TX here:https://explorer.solana.com/tx/{}/?cluster=devnet", signature);
    }

    // I had to send an update transaction due to an error made
    #[test]
    fn update(){
        // Create a Solana devnet connection
        let rpc_client = RpcClient::new(RPC_URL);

        let signer = read_keypair_file("wallet.json").expect("Couldn't find wallet file");

        let prereq = Turbin3PrereqProgram::derive_program_address(&[b"prereq",signer.pubkey().to_bytes().as_ref()]);

        // Define our instruction data 
        let args = UpdateArgs{github: b"antonineutron".to_vec() };

        let blockhash = rpc_client.get_latest_blockhash().expect("Failed to get recent blockhash");

        // Now we can invoke the "complete" function 
        let transaction = Turbin3PrereqProgram::update(
            &[&signer.pubkey(), 
            &prereq, 
            &system_program::id()
        ], &args, Some(&signer.pubkey()),&[&signer],blockhash );

        let signature = rpc_client.send_and_confirm_transaction(&transaction).expect("Failed to send transaction");

        // Print our transaction out on console
        println!("Success! Check out your Transaction here:https://explorer.solana.com/tx/{}/?cluster=devnet", signature);
    }

    #[test]
    fn base58_to_wallet() {
        println!("Input your private key as base58:");
        let stdin = io::stdin();
        let base58 = stdin.lock().lines().next().unwrap().unwrap(); 

        println!("Your wallet file is:");
        let wallet = bs58::decode(base58).into_vec().unwrap(); 
        println!("{:?}", wallet);
    }

    #[test]
    fn wallet_to_base58() {
        println!("Input your private key as a wallet file byte array:"); let stdin = io::stdin(); let
        wallet = stdin.lock().lines().next().unwrap().unwrap()
        .trim_start_matches('[').trim_end_matches(']').split(',') 
        .map(|s| s.trim().parse::<u8>().unwrap()).collect::<Vec<u8>>();

        println!("Your private key is:");
        let base58 = bs58::encode(wallet).into_string(); 
        println!("{:?}", base58);
    }
}
