// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Base} from './Base.sol';
import {Bill, BillType} from './interfaces/Bill.sol';
import {Transaction, TransactionType} from './interfaces/Transaction.sol';
import {ERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Gateway is Base {
    event TokenEnlisted(address indexed tokenAddress);
    event TokenDelisted(address indexed tokenAddress);
    event BillProcessed(
        address indexed from,
        uint256 indexed id,
        bytes externalTxId,
        bytes billId,
        uint256 timestamp
    );

    uint256 public txCount;
    uint256 public billCount;
    address[] private _tokenAddresses;

    mapping(uint256 => Bill) private _bills;
    mapping(address => bool) private _enlistedTokens;
    mapping(uint256 => Transaction) private _transactions;
    mapping(bytes => uint256) private _extBillIdToBill;
    mapping(bytes => uint256) private _extIdToTransaction;

    modifier onlyEnlistedToken(address tokenAddress) {
        if (tokenAddress != address(0)) {
            require(
                _enlistedTokens[tokenAddress] == true,
                _initError(ERROR_NOT_FOUND)
            );
        }
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin) public initializer {
        init_base_app(admin);
        _grantRole(MODERATOR_ROLE, admin);
        _enlistedTokens[address(0)] = true;
    }

    function processBill(
        uint256 _amount,
        bytes memory externalTxId,
        bytes memory billId,
        bytes memory providerId,
        address tokenAddress,
        TransactionType txType,
        BillType billType
    ) public payable onlyEnlistedToken(tokenAddress) {
        uint256 amount;
        if (tokenAddress == address(0)) {
            require(msg.value > 0, _initError(ERROR_INVALID_PRICE));
            amount = msg.value;
        } else {
            ERC20Upgradeable token = ERC20Upgradeable(tokenAddress);
            require(
                token.balanceOf(msg.sender) >= _amount && _amount > 0,
                _initError(ERROR_INVALID_PRICE)
            );
            require(
                token.transferFrom(msg.sender, address(this), _amount),
                _initError(ERROR_PROCESS_FAILED)
            );
            amount = _amount;
        }

        _bills[billCount] = Bill(
            billId,
            providerId,
            billType,
            msg.sender,
            amount,
            block.timestamp
        );
        _extBillIdToBill[billId] = billCount;

        uint256 txId = txCount;
        _transactions[txId] = Transaction(
            externalTxId,
            billCount,
            txType,
            payable(msg.sender),
            amount,
            0,
            block.timestamp,
            tokenAddress,
            ''
        );
        _extIdToTransaction[externalTxId] = txId;

        txCount++;
        billCount++;

        emit BillProcessed(
            msg.sender,
            txId,
            externalTxId,
            billId,
            block.timestamp
        );
    }

    function batchEnlistTokens(
        address[] memory tokenAddress
    ) public onlyRole(MODERATOR_ROLE) {
        for (uint256 i = 0; i < tokenAddress.length; i++) {
            if (tokenAddress[i] != address(0)) {
                _enlistedTokens[tokenAddress[i]] = true;
                _tokenAddresses.push(tokenAddress[i]);
                emit TokenEnlisted(tokenAddress[i]);
            }
        }
    }

    function batchDelistTokens(
        address[] memory tokenAddress
    ) public onlyRole(MODERATOR_ROLE) {
        for (uint256 i = 0; i < tokenAddress.length; i++) {
            if (tokenAddress[i] != address(0)) {
                _enlistedTokens[tokenAddress[i]] = false;
                emit TokenDelisted(tokenAddress[i]);
            }
        }
    }
}
