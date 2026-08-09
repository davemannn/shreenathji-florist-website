-- OrderRefund.reason was plain VARCHAR(191) but the form allows up to 300
-- chars (processRefundSchema) — widen to TEXT so a real admin-entered
-- reason can't silently fail past 191 characters.
ALTER TABLE `OrderRefund` MODIFY COLUMN `reason` TEXT NULL;
