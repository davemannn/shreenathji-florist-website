-- Address: optional geocode from the Google Places picker
ALTER TABLE `Address`
  ADD COLUMN `latitude` DOUBLE NULL,
  ADD COLUMN `longitude` DOUBLE NULL;

-- Order: snapshotted delivery geocode (may be null for older orders)
ALTER TABLE `Order`
  ADD COLUMN `deliveryLatitude` DOUBLE NULL,
  ADD COLUMN `deliveryLongitude` DOUBLE NULL;

-- StoreSettings: store location + delivery serviceability radius
ALTER TABLE `StoreSettings`
  ADD COLUMN `storeLatitude` DOUBLE NULL,
  ADD COLUMN `storeLongitude` DOUBLE NULL,
  ADD COLUMN `deliveryRadiusKm` INTEGER NOT NULL DEFAULT 10;

-- User: personal admin-sidebar reorder preference
ALTER TABLE `User`
  ADD COLUMN `adminNavOrder` JSON NULL;
