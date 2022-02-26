/*
  Warnings:

  - Added the required column `isCorrect` to the `Answers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Answers" ADD COLUMN     "isCorrect" BOOLEAN NOT NULL;
