import { BillProvider } from "@/bill/bill.provider";
import { GatewayService } from "@/contract/gateway/gateway.service";

export interface BillcheapActionProviderConfig {
  userId?: string;
  billProvider?: BillProvider;
  gateway?: GatewayService;
}