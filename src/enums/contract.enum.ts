export enum ContractBillType {
  Airtime,
  Data,
  Electricity,
  CableTv,
}

export enum ContractTxType {
  BillPayment,
  Loan,
}

export enum ContractEvents {
  BillProcessed = 'BillProcessed',
  Transfer = 'Transfer',
}
