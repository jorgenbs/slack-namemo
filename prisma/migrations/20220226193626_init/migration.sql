-- CreateTable
CREATE TABLE "Answers" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bySlackId" TEXT NOT NULL,
    "correctAnswerId" TEXT NOT NULL,
    "givenAnswerId" TEXT NOT NULL,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("id")
);
