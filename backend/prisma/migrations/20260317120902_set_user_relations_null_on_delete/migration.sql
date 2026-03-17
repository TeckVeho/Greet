-- DropForeignKey
ALTER TABLE `restaurants` DROP FOREIGN KEY `restaurants_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_author_id_fkey`;

-- DropIndex
DROP INDEX `restaurants_created_by_fkey` ON `restaurants`;

-- DropIndex
DROP INDEX `reviews_author_id_fkey` ON `reviews`;

-- AlterTable
ALTER TABLE `restaurants` MODIFY `created_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `reviews` MODIFY `author_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `restaurants` ADD CONSTRAINT `restaurants_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
