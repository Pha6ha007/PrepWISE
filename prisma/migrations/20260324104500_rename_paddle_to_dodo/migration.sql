-- Rename Paddle columns to Dodo Payments
ALTER TABLE "subscriptions" RENAME COLUMN "paddle_customer_id" TO "dodo_customer_id";
ALTER TABLE "subscriptions" RENAME COLUMN "paddle_subscription_id" TO "dodo_subscription_id";
