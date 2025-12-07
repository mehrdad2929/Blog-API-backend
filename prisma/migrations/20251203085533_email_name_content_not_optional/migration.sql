/*
  Warnings:

  - Made the column `email` on table `Author` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Author` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Author" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "content" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
