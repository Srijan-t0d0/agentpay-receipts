import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import { AgentpayEscrow } from "../target/types/agentpay_escrow";

describe("agentpay_escrow", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = anchor.workspace.agentpayEscrow as Program<AgentpayEscrow>;
  const payer = provider.wallet.publicKey;
  const agent = anchor.web3.Keypair.generate();

  const makeBytes = (seed: number, length: number) =>
    Array.from({ length }, (_, index) => (seed + index) % 256);

  const deriveTask = (taskId: number[]) =>
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("task"), payer.toBuffer(), Buffer.from(taskId)],
      program.programId,
    )[0];

  before(async () => {
    const tx = await provider.connection.requestAirdrop(
      agent.publicKey,
      anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(tx);
  });

  it("creates, funds, approves, and releases a SOL escrow receipt", async () => {
    const taskId = makeBytes(11, 16);
    const taskHash = makeBytes(31, 32);
    const deliverableHash = makeBytes(67, 32);
    const receiptHash = makeBytes(101, 32);
    const amount = new anchor.BN(0.25 * anchor.web3.LAMPORTS_PER_SOL);
    const taskEscrow = deriveTask(taskId);
    const agentBalanceBefore = await provider.connection.getBalance(agent.publicKey);

    await program.methods
      .createTask(taskId, taskHash, agent.publicKey, amount)
      .accounts({
        payer,
        taskEscrow,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    let account = await program.account.taskEscrow.fetch(taskEscrow);
    assert.deepEqual(account.status, { created: {} });
    assert.equal(account.agent.toBase58(), agent.publicKey.toBase58());
    assert.equal(account.amountLamports.toString(), amount.toString());

    await program.methods
      .fundTask()
      .accounts({
        payer,
        taskEscrow,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    account = await program.account.taskEscrow.fetch(taskEscrow);
    assert.deepEqual(account.status, { funded: {} });
    assert.isAbove(account.fundedAt.toNumber(), 0);

    await program.methods
      .approveTask(deliverableHash)
      .accounts({
        payer,
        taskEscrow,
      })
      .rpc();

    account = await program.account.taskEscrow.fetch(taskEscrow);
    assert.deepEqual(account.status, { approved: {} });
    assert.deepEqual(account.deliverableHash, deliverableHash);

    await program.methods
      .releasePayment(receiptHash)
      .accounts({
        payer,
        taskEscrow,
        agent: agent.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    account = await program.account.taskEscrow.fetch(taskEscrow);
    const agentBalanceAfter = await provider.connection.getBalance(agent.publicKey);

    assert.deepEqual(account.status, { paid: {} });
    assert.deepEqual(account.receiptHash, receiptHash);
    assert.equal(agentBalanceAfter - agentBalanceBefore, amount.toNumber());
  });

  it("rejects release before approval", async () => {
    const taskId = makeBytes(151, 16);
    const taskHash = makeBytes(171, 32);
    const receiptHash = makeBytes(191, 32);
    const amount = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);
    const taskEscrow = deriveTask(taskId);

    await program.methods
      .createTask(taskId, taskHash, agent.publicKey, amount)
      .accounts({
        payer,
        taskEscrow,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .fundTask()
      .accounts({
        payer,
        taskEscrow,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    try {
      await program.methods
        .releasePayment(receiptHash)
        .accounts({
          payer,
          taskEscrow,
          agent: agent.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      assert.fail("release should fail before approval");
    } catch (error) {
      assert.include(`${error}`, "InvalidStatus");
    }
  });

  it("rejects approval from a non-payer signer", async () => {
    const taskId = makeBytes(211, 16);
    const taskHash = makeBytes(221, 32);
    const deliverableHash = makeBytes(231, 32);
    const intruder = anchor.web3.Keypair.generate();
    const amount = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);
    const taskEscrow = deriveTask(taskId);

    await program.methods
      .createTask(taskId, taskHash, agent.publicKey, amount)
      .accounts({
        payer,
        taskEscrow,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .fundTask()
      .accounts({
        payer,
        taskEscrow,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    try {
      await program.methods
        .approveTask(deliverableHash)
        .accounts({
          payer: intruder.publicKey,
          taskEscrow,
        })
        .signers([intruder])
        .rpc();
      assert.fail("approval should fail for non-payer signer");
    } catch (error) {
      assert.include(`${error}`, "UnauthorizedPayer");
    }
  });
});
