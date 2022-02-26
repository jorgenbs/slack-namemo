import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function readAnswers() {
  // ... you will write your Prisma Client queries here
  const allAnswers = await prisma.answers.findMany();
  return allAnswers;
}

export async function writeAnswer({
  bySlackId,
  correctAnswerId,
  givenAnswerId,
  isCorrect,
}) {
  return await prisma.answers.create({
    data: {
      bySlackId,
      correctAnswerId,
      givenAnswerId,
      isCorrect,
    },
  });
}

export default prisma;
