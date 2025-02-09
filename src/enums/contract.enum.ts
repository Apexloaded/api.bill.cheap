export enum ContractBillType {
  AIRTIME,
  ELECTRICITY,
  CABLE_TV,
  MOBILE_DATA,
  WATER,
  INTERNET,
}

export enum ContractTxType {
  BillPayment,
  Loan,
}

export enum ContractEvents {
  BillProcessed = 'BillProcessed',
  Transfer = 'Transfer',
}
