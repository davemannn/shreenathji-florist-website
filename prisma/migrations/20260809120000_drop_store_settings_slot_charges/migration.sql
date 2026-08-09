-- Removes the duplicated StoreSettings.expressCharge/midnightCharge columns.
-- These were a separate, independently-editable number that could drift out
-- of sync with the real per-slot DeliverySlot.extraCharge actually charged
-- at checkout. The DeliverySlot rows are now the single source of truth for
-- both what's charged and what's advertised on the marketing pages — see
-- delivery-slot.repository.ts's findActiveDeliverySlotByType.
ALTER TABLE `StoreSettings` DROP COLUMN `expressCharge`;
ALTER TABLE `StoreSettings` DROP COLUMN `midnightCharge`;
