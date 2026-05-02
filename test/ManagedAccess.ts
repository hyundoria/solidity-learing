import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";

describe("ManagedAccess - Multi Manager Confirmation", () => {

  let signers: HardhatEthersSigner[];
  let myTokenC: MyToken;

  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      DECIMALS,
      MINTING_AMOUNT,
    ]);
  });

  describe("Manager Registration", () => {
    it("should allow owner to add multiple managers", async () => {
      const owner = signers[0];
      const manager1 = signers[1];
      const manager2 = signers[2];
      const manager3 = signers[3];

      await myTokenC.connect(owner).addManager(manager1.address);
      await myTokenC.connect(owner).addManager(manager2.address);
      await myTokenC.connect(owner).addManager(manager3.address);

    });
})

  describe("Confirmation", () => {
    beforeEach(async () => {
      const owner = signers[0];
      const manager1 = signers[1];
      const manager2 = signers[2];
      const manager3 = signers[3];

      await myTokenC.connect(owner).addManager(manager1.address);
      await myTokenC.connect(owner).addManager(manager2.address);
      await myTokenC.connect(owner).addManager(manager3.address);
    });

    it("should allow manager to confirm transaction", async () => {
      const manager1 = signers[1];

      // manager1이 confirm 전에는 false
      expect(await myTokenC.confirmed(manager1.address)).equal(false);

      // manager1이 confirm
      await myTokenC.connect(manager1).confirmTransaction();

      // confirm 후에는 true
      expect(await myTokenC.confirmed(manager1.address)).equal(true);
    });

    it("should not allow non-manager to confirm", async () => {
      const nonManager = signers[5];

      await expect(
        myTokenC.connect(nonManager).confirmTransaction(),
      ).to.be.revertedWith("You are not a manager");
    });

    it("should revert setRewardPerBlock when not all managers confirmed", async () => {
      const owner = signers[0];
      const manager1 = signers[1];
      const manager2 = signers[2];
      const rewardAmount = hre.ethers.parseUnits("10", DECIMALS);

      // TinyBank 배포
      const tinyBankC = await hre.ethers.deployContract("TinyBank", [
        await myTokenC.getAddress(),
      ]);

      // TinyBank에 manager 추가
      await tinyBankC.connect(owner).addManager(manager1.address);
      await tinyBankC.connect(owner).addManager(manager2.address);

      // owner와 manager1만 confirm
      await tinyBankC.connect(owner).confirmTransaction();
      await tinyBankC.connect(manager1).confirmTransaction();

      await expect(
        tinyBankC.connect(owner).setRewardPerBlock(rewardAmount),
      ).to.be.revertedWith("Not all confirmed yet");
      
    });

    it("should allow setRewardPerBlock when all managers confirmed", async () => {
      const owner = signers[0];
      const manager1 = signers[1];
      const manager2 = signers[2];
      const manager3 = signers[3];
      const rewardAmount = hre.ethers.parseUnits("10", DECIMALS);

      // TinyBank 배포
      const tinyBankC = await hre.ethers.deployContract("TinyBank", [
        await myTokenC.getAddress(),
      ]);

      // TinyBank에 manager 추가
      await tinyBankC.connect(owner).addManager(manager1.address);
      await tinyBankC.connect(owner).addManager(manager2.address);
      await tinyBankC.connect(owner).addManager(manager3.address);

      // 모든 manager가 confirm
      await tinyBankC.connect(owner).confirmTransaction();
      await tinyBankC.connect(manager1).confirmTransaction();
      await tinyBankC.connect(manager2).confirmTransaction();
      await tinyBankC.connect(manager3).confirmTransaction();
      
      // setRewardPerBlock 호출 성공
      await expect(tinyBankC.connect(owner).setRewardPerBlock(rewardAmount)).to
        .not.be.reverted;
    });

  });
})