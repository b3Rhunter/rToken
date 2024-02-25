// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RToken is ERC20, ReentrancyGuard, Ownable {
    uint256 public constant MAX_SUPPLY = 69000000 * 10 ** 18; 
    uint256 public constant TOKEN_PRICE_ETH = 0.00003 ether; 

    constructor() ERC20("R Token", "ARR") {
        uint256 initialMintAmount = 420000 * 10 ** 18; 
        require(totalSupply() + initialMintAmount <= MAX_SUPPLY, "Initial mint exceeds max supply");
        _mint(msg.sender, initialMintAmount);
    }

    function mint(uint256 amountToMint) public payable nonReentrant {
        require(amountToMint > 0, "Must mint at least one token");
        uint256 requiredEth = TOKEN_PRICE_ETH * amountToMint;
        require(msg.value >= requiredEth, "Not enough ETH sent"); 

        uint256 supplyAfterMint = totalSupply() + amountToMint;
        require(supplyAfterMint <= MAX_SUPPLY, "Minting would exceed max supply");

        _mint(msg.sender, amountToMint);
        
        if (msg.value > requiredEth) {
            payable(msg.sender).transfer(msg.value - requiredEth);
        }
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if (from == address(0)) { 
            require(totalSupply() + amount <= MAX_SUPPLY, "Transfer would exceed max supply");
        }
        super._beforeTokenTransfer(from, to, amount);
    }
}
