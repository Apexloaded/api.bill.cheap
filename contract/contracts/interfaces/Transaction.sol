// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

enum TransactionType {
    BillPayment,
    Loan
}

struct Transaction {
    bytes extId;
    uint256 billId;
    TransactionType txType;
    address payable sender;
    uint256 txAmount;
    uint256 txFee;
    uint256 txDate;
    address tokenAddress;
    string remark;
}
