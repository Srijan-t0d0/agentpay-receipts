use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("JCW13wdxf6zPVu6NNCS2uMrCm3x9PP5JKJN64Cmo1vQj");

#[program]
pub mod agentpay_escrow {
    use super::*;

    pub fn create_task(
        ctx: Context<CreateTask>,
        task_id: [u8; 16],
        task_hash: [u8; 32],
        agent: Pubkey,
        amount_lamports: u64,
    ) -> Result<()> {
        require!(amount_lamports > 0, AgentPayError::InvalidAmount);

        let clock = Clock::get()?;
        let task = &mut ctx.accounts.task_escrow;

        task.payer = ctx.accounts.payer.key();
        task.agent = agent;
        task.task_id = task_id;
        task.task_hash = task_hash;
        task.deliverable_hash = [0; 32];
        task.receipt_hash = [0; 32];
        task.amount_lamports = amount_lamports;
        task.status = TaskStatus::Created;
        task.created_at = clock.unix_timestamp;
        task.funded_at = 0;
        task.approved_at = 0;
        task.paid_at = 0;
        task.bump = ctx.bumps.task_escrow;

        emit!(TaskCreated {
            task: task.key(),
            payer: task.payer,
            agent: task.agent,
            amount_lamports,
            task_hash,
        });

        Ok(())
    }

    pub fn fund_task(ctx: Context<FundTask>) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.task_escrow.payer,
            ctx.accounts.payer.key(),
            AgentPayError::UnauthorizedPayer
        );
        require!(
            ctx.accounts.task_escrow.status == TaskStatus::Created,
            AgentPayError::InvalidStatus
        );

        let amount = ctx.accounts.task_escrow.amount_lamports;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.task_escrow.to_account_info(),
                },
            ),
            amount,
        )?;

        let clock = Clock::get()?;
        let task = &mut ctx.accounts.task_escrow;
        task.status = TaskStatus::Funded;
        task.funded_at = clock.unix_timestamp;

        emit!(TaskFunded {
            task: task.key(),
            payer: task.payer,
            amount_lamports: amount,
        });

        Ok(())
    }

    pub fn approve_task(ctx: Context<ApproveTask>, deliverable_hash: [u8; 32]) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.task_escrow.payer,
            ctx.accounts.payer.key(),
            AgentPayError::UnauthorizedPayer
        );
        require!(
            ctx.accounts.task_escrow.status == TaskStatus::Funded,
            AgentPayError::InvalidStatus
        );
        require!(
            ctx.accounts.task_escrow.deliverable_hash == [0; 32],
            AgentPayError::HashAlreadySet
        );

        let clock = Clock::get()?;
        let task = &mut ctx.accounts.task_escrow;
        task.deliverable_hash = deliverable_hash;
        task.status = TaskStatus::Approved;
        task.approved_at = clock.unix_timestamp;

        emit!(TaskApproved {
            task: task.key(),
            payer: task.payer,
            deliverable_hash,
        });

        Ok(())
    }

    pub fn release_payment(ctx: Context<ReleasePayment>, receipt_hash: [u8; 32]) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.task_escrow.payer,
            ctx.accounts.payer.key(),
            AgentPayError::UnauthorizedPayer
        );
        require_keys_eq!(
            ctx.accounts.task_escrow.agent,
            ctx.accounts.agent.key(),
            AgentPayError::InvalidAgent
        );
        require!(
            ctx.accounts.task_escrow.status == TaskStatus::Approved,
            AgentPayError::InvalidStatus
        );
        require!(
            ctx.accounts.task_escrow.receipt_hash == [0; 32],
            AgentPayError::HashAlreadySet
        );

        let amount = ctx.accounts.task_escrow.amount_lamports;
        let rent_floor = Rent::get()?.minimum_balance(TaskEscrow::LEN);
        let escrow_balance = ctx.accounts.task_escrow.to_account_info().lamports();

        require!(
            escrow_balance >= rent_floor.saturating_add(amount),
            AgentPayError::InsufficientEscrowBalance
        );

        **ctx
            .accounts
            .task_escrow
            .to_account_info()
            .try_borrow_mut_lamports()? -= amount;
        **ctx
            .accounts
            .agent
            .to_account_info()
            .try_borrow_mut_lamports()? += amount;

        let clock = Clock::get()?;
        let task = &mut ctx.accounts.task_escrow;
        task.receipt_hash = receipt_hash;
        task.status = TaskStatus::Paid;
        task.paid_at = clock.unix_timestamp;

        emit!(PaymentReleased {
            task: task.key(),
            payer: task.payer,
            agent: task.agent,
            amount_lamports: amount,
            receipt_hash,
        });

        Ok(())
    }

    pub fn cancel_task(ctx: Context<CancelTask>) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.task_escrow.payer,
            ctx.accounts.payer.key(),
            AgentPayError::UnauthorizedPayer
        );
        require!(
            matches!(
                ctx.accounts.task_escrow.status,
                TaskStatus::Created | TaskStatus::Funded
            ),
            AgentPayError::InvalidStatus
        );

        let task = &mut ctx.accounts.task_escrow;

        if task.status == TaskStatus::Funded {
            let amount = task.amount_lamports;
            let rent_floor = Rent::get()?.minimum_balance(TaskEscrow::LEN);
            let escrow_balance = task.to_account_info().lamports();

            require!(
                escrow_balance >= rent_floor.saturating_add(amount),
                AgentPayError::InsufficientEscrowBalance
            );

            **task.to_account_info().try_borrow_mut_lamports()? -= amount;
            **ctx.accounts.payer.to_account_info().try_borrow_mut_lamports()? += amount;
        }

        task.status = TaskStatus::Cancelled;

        emit!(TaskCancelled {
            task: task.key(),
            payer: task.payer,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(task_id: [u8; 16])]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + TaskEscrow::LEN,
        seeds = [b"task", payer.key().as_ref(), task_id.as_ref()],
        bump
    )]
    pub task_escrow: Account<'info, TaskEscrow>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundTask<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task_escrow.payer.as_ref(), task_escrow.task_id.as_ref()],
        bump = task_escrow.bump
    )]
    pub task_escrow: Account<'info, TaskEscrow>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveTask<'info> {
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task_escrow.payer.as_ref(), task_escrow.task_id.as_ref()],
        bump = task_escrow.bump
    )]
    pub task_escrow: Account<'info, TaskEscrow>,
}

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task_escrow.payer.as_ref(), task_escrow.task_id.as_ref()],
        bump = task_escrow.bump
    )]
    pub task_escrow: Account<'info, TaskEscrow>,
    /// CHECK: This account is checked against the stored agent pubkey before lamports are credited.
    #[account(mut)]
    pub agent: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelTask<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task_escrow.payer.as_ref(), task_escrow.task_id.as_ref()],
        bump = task_escrow.bump
    )]
    pub task_escrow: Account<'info, TaskEscrow>,
}

#[account]
pub struct TaskEscrow {
    pub payer: Pubkey,
    pub agent: Pubkey,
    pub task_id: [u8; 16],
    pub task_hash: [u8; 32],
    pub deliverable_hash: [u8; 32],
    pub receipt_hash: [u8; 32],
    pub amount_lamports: u64,
    pub status: TaskStatus,
    pub created_at: i64,
    pub funded_at: i64,
    pub approved_at: i64,
    pub paid_at: i64,
    pub bump: u8,
}

impl TaskEscrow {
    pub const LEN: usize = 32 + 32 + 16 + 32 + 32 + 32 + 8 + 1 + 8 + 8 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TaskStatus {
    Created,
    Funded,
    Approved,
    Paid,
    Cancelled,
}

#[event]
pub struct TaskCreated {
    pub task: Pubkey,
    pub payer: Pubkey,
    pub agent: Pubkey,
    pub amount_lamports: u64,
    pub task_hash: [u8; 32],
}

#[event]
pub struct TaskFunded {
    pub task: Pubkey,
    pub payer: Pubkey,
    pub amount_lamports: u64,
}

#[event]
pub struct TaskApproved {
    pub task: Pubkey,
    pub payer: Pubkey,
    pub deliverable_hash: [u8; 32],
}

#[event]
pub struct PaymentReleased {
    pub task: Pubkey,
    pub payer: Pubkey,
    pub agent: Pubkey,
    pub amount_lamports: u64,
    pub receipt_hash: [u8; 32],
}

#[event]
pub struct TaskCancelled {
    pub task: Pubkey,
    pub payer: Pubkey,
}

#[error_code]
pub enum AgentPayError {
    #[msg("The task is not in the required status for this action.")]
    InvalidStatus,
    #[msg("Only the payer that created the task can perform this action.")]
    UnauthorizedPayer,
    #[msg("The provided agent account does not match the task agent.")]
    InvalidAgent,
    #[msg("The escrow account does not have enough lamports for the requested payment.")]
    InsufficientEscrowBalance,
    #[msg("Escrow amount must be greater than zero.")]
    InvalidAmount,
    #[msg("This hash has already been set.")]
    HashAlreadySet,
}
