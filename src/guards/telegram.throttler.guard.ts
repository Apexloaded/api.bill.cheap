import { Injectable, ExecutionContext } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerRequest,
  ThrottlerException,
} from '@nestjs/throttler';
import { Context } from 'telegraf';

@Injectable()
export class TelegramThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration } = requestProps;

    const ctx = context.getArgByIndex(0) as Context;
    const userId = ctx.from?.id;

    if (!userId) {
      // If the user ID is not available, assume they're not rate-limited
      return true;
    }

    const key = this.generateKey(context, userId.toString());
    const { totalHits } = await this.storageService.increment(
      key,
      ttl,
      limit,
      blockDuration,
      throttler.name,
    );

    if (totalHits > limit) {
      await this.handleThrottling(ctx, { limit, ttl });
      return false;
    }

    return true;
  }

  protected generateKey(context: ExecutionContext, suffix: string): string {
    return `${context.getClass().name}-${context.getHandler().name}-${suffix}`;
  }

  protected async handleThrottling(
    ctx: Context,
    { limit, ttl }: { limit: number; ttl: number },
  ): Promise<void> {
    const message = `Rate limit of ${limit} requests per ${ttl} seconds exceeded. Please try again later.`;
    await ctx.reply(message);
    throw new ThrottlerException(message);
  }

  // Override the original throwThrottlingException to match the base class signature
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any, // Use 'any' here to avoid importing ThrottlerLimitDetail
  ): Promise<void> {
    const ctx = context.getArgByIndex(0) as Context;
    await this.handleThrottling(ctx, {
      limit: throttlerLimitDetail.limit,
      ttl: throttlerLimitDetail.ttl,
    });
  }
}
