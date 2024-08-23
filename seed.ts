import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Initialisation des données pour la table Unit
  const unitMeter = await prisma.unit.create({
    data: {
      name: 'Mètre',
    },
  });

  const unitSpool = await prisma.unit.create({
    data: {
      name: 'Bobine',
    },
  });

  const unitPiece = await prisma.unit.create({
    data: {
      name: 'Pièce',
    },
  });

  // Initialisation des données pour la table Category
  const categoryFabric = await prisma.category.create({
    data: {
      name: 'Tissus',
      image: 'tissus.png',
      unitId: unitMeter.id,  // Associée à l'unité Mètre
    },
  });

  const categoryThread = await prisma.category.create({
    data: {
      name: 'Fils',
      image: 'fils.png',
      unitId: unitSpool.id,  // Associée à l'unité Bobine
    },
  });

  const categoryNeedle = await prisma.category.create({
    data: {
      name: 'Aiguilles',
      image: 'aiguilles.png',
      unitId: unitPiece.id,  // Associée à l'unité Pièce
    },
  });

  // Initialisation des données pour la table Article
  await prisma.article.create({
    data: {
      name: 'Coton imprimé',
      stockQuantity: 50,
      unitPrice: 10.0,
      photo: 'coton-imprime.png',
      color: 'Bleu',
      userId: 3,  // Assurez-vous que l'utilisateur avec id=1 existe
      categoryId: categoryFabric.id,
    },
  });

  await prisma.article.create({
    data: {
      name: 'Fil polyester',
      stockQuantity: 100,
      unitPrice: 2.5,
      photo: 'fil-polyester.png',
      color: 'Blanc',
      userId: 3,  // Assurez-vous que l'utilisateur avec id=1 existe
      categoryId: categoryThread.id,
    },
  });

  await prisma.article.create({
    data: {
      name: 'Aiguilles à coudre',
      stockQuantity: 200,
      unitPrice: 1.0,
      photo: 'aiguilles.png',
      color: 'Argent',
      userId: 3,  // Assurez-vous que l'utilisateur avec id=1 existe
      categoryId: categoryNeedle.id,
    },
  });

  console.log('Seeding terminé.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
