// staking
// deposit(MyToken) / withdraw(MyToken)


// MyToken : token balance management
// - the balance of TinyBank address
// TinyBank : deposit / withdraw valut
// - users token management
// -user --> deposit --> tinyBank --> transfer(user --> TinyBank)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ManagedAccess.sol";

interface IMyToken {

    function transfer(uint256 amout, address to) external;

    function transferFrom(address from, address to, uint256 amout) external;

    function mint(uint256 amout, address to) external;

}

contract TinyBank is ManagedAccess{

    event Staked(address from, uint256);
    event Withdraw(uint256, address to);

    IMyToken public stakingToken;

    mapping(address => uint256) public lastClaimedBlock;

    uint256 defaultRewardPerBlock = 1 * 10 ** 18;
    uint256 rewardPerBlock;

    mapping(address => uint256) public staked;
    uint256 public totalStaked;

    constructor(IMyToken _stakingToken) ManagedAccess(msg.sender, msg.sender) {
        stakingToken = _stakingToken;
        rewardPerBlock = defaultRewardPerBlock;
    }


    // genesis staking
    modifier updateReward(address to) {
        
        if (staked[to] > 0) {
            uint256 blocks = block.number - lastClaimedBlock[to];
            uint256 reward = (blocks * rewardPerBlock * staked[to]) / totalStaked;
            stakingToken.mint(reward, to);
        }
        lastClaimedBlock[to] = block.number;
        _;
        
    }

    function stake(uint256 _amout) external updateReward(msg.sender) {

        require(_amout >= 0, "cannot stake 0 amout");
        stakingToken.transferFrom(msg.sender, address(this), _amout);
        staked[msg.sender] += _amout;
        totalStaked += _amout;
        emit Staked(msg.sender, _amout);

    }

    function setRewardPerBlock(uint256 _amout) external onlyAllConfirmed {

        rewardPerBlock = _amout;
    }

    function withdraw(uint256 _amout) external updateReward(msg.sender) {

        require(staked[msg.sender] >= _amout, "insufficiient staked token");
        stakingToken.transfer(_amout, msg.sender);
        staked[msg.sender] -= _amout;
        totalStaked -= _amout;
        emit Withdraw(_amout, msg.sender);

    }

}