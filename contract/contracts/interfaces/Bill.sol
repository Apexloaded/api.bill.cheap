// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

enum BillType {
    Airtime,
    Data,
    Electricity,
    CableTv
}

struct Bill {
    bytes billId;
    bytes providerId;
    BillType billType;
    address processedBy;
    uint256 amount;
    uint256 timestamp;
}
