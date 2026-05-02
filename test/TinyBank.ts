import hre from "hardhat";
import { expect } from "chai"
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { TinyBank } from "../typechain-types";

describe("TinyBank", () => {

    let signers: HardhatEthersSigner[];
    let myTokenC: MyToken;
    let tinyBankC: TinyBank;
    
    beforeEach(async () => {
        signers = await hre.ethers.getSigners();
        myTokenC = await hre.ethers.deployContract("MyToken", [
            "MyToken",
            "MT",
            DECIMALS,
            MINTING_AMOUNT,
        ]);
        tinyBankC = await hre.ethers.deployContract("TinyBank", [
            await myTokenC.getAddress(),
        ]);
        await myTokenC.setManager(tinyBankC.getAddress());
    });

    describe("Initialized state check", () => {

    it("shold return totalStaked 0", async () => {
        expect(await tinyBankC.totalStaked()).equal(0);
    });
    it("should return staked 0 amount of signer0", async () => {
        const signer0 = signers[0];
        expect(await tinyBankC.staked(signer0.address)).equal(0);

        })
    });

    describe("Staking", () => {

    it("shold return totalStaked 0", async () => {
        
        const signer0 = signers[0];
        const stakingAmout = hre.ethers.parseUnits("50", DECIMALS);
        await myTokenC.approve(await tinyBankC.getAddress(), stakingAmout);
        await tinyBankC.stake(stakingAmout);
        expect(await tinyBankC.staked(signer0.address)).equal(stakingAmout);
        expect(await tinyBankC.totalStaked()).equal(stakingAmout);
        expect(await myTokenC.balanceOf(tinyBankC)).equal(
            await tinyBankC.totalStaked()
        );
        
    });

    });

    describe("Withdraw", () => {

    it("shold return 0 staked after withdrawing total token", async () => {
        
        const signer0 = signers[0];
        const stakingAmout = hre.ethers.parseUnits("50", DECIMALS);
        await myTokenC.approve(await tinyBankC.getAddress(), stakingAmout);
        await tinyBankC.stake(stakingAmout);
        await tinyBankC.withdraw(stakingAmout);
        expect(await tinyBankC.staked(signer0.address)).equal(0);
        
    });

    });

    describe("reward", () => {

    it("shold reward 1MT every blocks", async () => {
        
        const signer0 = signers[0];
        const stakingAmout = hre.ethers.parseUnits("50", DECIMALS);
        await myTokenC.approve(await tinyBankC.getAddress(), stakingAmout);
        await tinyBankC.stake(stakingAmout);

        const BLOCKS = 5n;
        const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
        for (var i=0; i<BLOCKS; i++) {
            await myTokenC.transfer(transferAmount, signer0.address);
        }

        await tinyBankC.withdraw(stakingAmout);
        expect(await myTokenC.balanceOf(signer0.address)).equal(
            hre.ethers.parseUnits((BLOCKS + MINTING_AMOUNT + 1n).toString())
        );
        
    });

    it("should revert when changing rewardPerBlock by hacker", async () => {

        const hacker = signers[3];
        const rewardToChange = hre.ethers.parseUnits("10000", DECIMALS);
        await expect(
            tinyBankC.connect(hacker).setRewardPerBlock(rewardToChange)
        ).to.be.revertedWith("You are not authorized to manage this contract");

    });
    });

});

