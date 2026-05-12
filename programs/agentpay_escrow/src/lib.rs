use anchor_lang::prelude::*;

declare_id!("FKqzKRqigoQWZBqSse7nht51y8kjBGLHF2LqBQddDimk");

#[program]
pub mod agentpay_escrow {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
