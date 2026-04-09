import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"

const mintingAmount = 100n;
const decimals = 18n;

describe("My Token", () => {

    let myTokenC: MyToken;
    let signers: HardhatEthersSigner[];

    beforeEach("should deploy", async () => {
        
        signers = await hre.ethers.getSigners();
        myTokenC = await hre.ethers.deployContract("MyToken", ["MyToken", "MT", decimals, mintingAmount,]);
        
    });
    
    describe("Basic state value check", () => {

        it("should return name", async () => {

            expect(await myTokenC.name()).equal("MyToken");
        });
        it("should return symbol", async () => {

            expect(await myTokenC.symbol()).equal("MT");
        });
        it("should return decimals", async () => {

            expect(await myTokenC.decimals()).equal(decimals);
        });
        it("should return 100 totalSupply", async () => {
            expect(await myTokenC.totalSupply()).equal(
                mintingAmount * 10n ** decimals
            );
        });
    });

    describe("Mint", () => {

        it("should return 1MT balance for signer 0", async () => {
            const sigenr0 = signers[0];
            expect(await myTokenC.balanceOf(sigenr0)).equal(mintingAmount * 10n ** decimals)
        });

    })

    describe("Transfer", () => {
        it("shoud have 0.5MT", async () => {
            const sigenr1 = signers[1];
            await myTokenC.transfer(hre.ethers.parseUnits("0.5", decimals), sigenr1.address);
            expect(await myTokenC.balanceOf(sigenr1.address)).equal(
                hre.ethers.parseUnits("0.5", decimals)
            );
        });
        it ("shoud be reverted with insufficient balance error", async () => {
            const sigenr1 = signers[1];
            await expect(
                myTokenC.transfer(hre.ethers.parseUnits((mintingAmount + 1n).toString(), decimals), sigenr1.address)
            ).to.be.revertedWith("insufficient balance");
        });
    });
    
    

    describe("TransferFrom", () =>  {

        it("should emit Approval event", async () => {
            const sigenr1 = signers[1];
            await expect(
                myTokenC.approve(sigenr1.address, hre.ethers.parseUnits("10", decimals))
            ).to.emit(myTokenC, "Approval")
            .withArgs(sigenr1.address, hre.ethers.parseUnits("10", decimals))
        });

        it("should be reverted with insufficient allowance error", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];

            await expect(
                myTokenC
                    .connect(signer1)
                    .transferFrom(
                        signer0.address, 
                        signer1.address, 
                        hre.ethers.parseUnits("1", decimals))
            ).to.be.revertedWith("insufficient allowance")
        })

        it("homework1", async () => {
            
            const sigenr0 = signers[0];
            const sigenr1 = signers[1];
            const amount = hre.ethers.parseUnits("10", decimals);

            await myTokenC.connect(sigenr0).approve(sigenr1.address, amount);
            await myTokenC.connect(sigenr1).transferFrom(sigenr0.address, sigenr1.address, amount);
            expect(await myTokenC.balanceOf(sigenr1.address)).to.equal(amount);
            expect(await myTokenC.balanceOf(sigenr0.address)).to.equal((mintingAmount * 10n **decimals) - amount) ;

        })

    });
    

});