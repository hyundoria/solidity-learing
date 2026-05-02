// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract ManagedAccess {

    address public owner;
    
    address[] public managerList;
    mapping(address => bool) public managers;
    mapping(address => bool) public confirmed;

    constructor(address _owner, address _manager) {

        owner = _owner;
        managerList.push(_manager);
        managers[_manager] = true;

    }

    function addManager(address _manager) public {
        require(msg.sender == owner, "Only owner can add manager");
        require(!managers[_manager], "Already a manager");
        
        managerList.push(_manager);
        managers[_manager] = true;
    }

    function confirmTransaction() external {
        require(managers[msg.sender], "You are not a manager");
        confirmed[msg.sender] = true;
    }

    function _resetConfirmations() internal {
        for (uint256 i = 0; i < managerList.length; i++) {
            confirmed[managerList[i]] = false;
        }
    }

    function resetConfirmations() external {
        require(msg.sender == owner, "Only owner can reset");
        _resetConfirmations();
    }

    modifier onlyAllConfirmed() {
        require(msg.sender == owner, "You are not authorized");
        
        for (uint256 i = 0; i < managerList.length; i++) {
            require(confirmed[managerList[i]], "Not all confirmed yet");
        }
        _;
        _resetConfirmations();
    }

    modifier onlyManager() {
        require(managers[msg.sender], "You are not a manager");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized");
        _;
    }


}