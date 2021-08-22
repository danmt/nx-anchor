use anchor_lang::prelude::*;

#[program]
pub mod <%= crateName %> {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
