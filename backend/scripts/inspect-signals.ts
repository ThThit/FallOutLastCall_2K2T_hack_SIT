import prisma from '../src/lib/prisma.js';

async function main(){
  const signals = await prisma.signal.findMany({ select: { id: true, authorName: true, verifiedCount: true, unverifiedCount: true, deletedAt: true } });
  console.log(signals);
  await prisma.$disconnect();
}

main().catch(err=>{console.error(err); prisma.$disconnect(); process.exit(1);});
