import { BillProvider } from "@/bill/bill.provider";
import { GatewayService } from "@/contract/gateway/gateway.service";

export interface BillcheapActionProviderConfig {
    wallet?: string;
  userId?: string;
  billProvider?: BillProvider;
  gateway?: GatewayService;
}