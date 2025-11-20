import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // ==================== ROLES ====================
  console.log('Creating roles...');
  const roleSimple = await prisma.role.upsert({
    where: { name: 'SIMPLE' },
    update: {},
    create: { name: 'SIMPLE' },
  });

  const roleAdmin = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const roleTailor = await prisma.role.upsert({
    where: { name: 'TAILOR' },
    update: {},
    create: { name: 'TAILOR' },
  });


  console.log('✅ Roles created');

  // ==================== USERS ====================
  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('passer123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@beyondfashion.com' },
    update: {},
    create: {
      email: 'admin@beyondfashion.com',
      password: hashedPassword,
      lastname: 'Admin',
      firstname: 'Super',
      phoneNumber: '+221771234567',
      gender: 'MALE',
      address: 'Dakar, Senegal',
      photoUrl: 'https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff&size=200',
      credit: 10000,
      roles: {
        connect: [{ id: roleAdmin.id }],
      },
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'marie.diop@example.com' },
    update: {},
    create: {
      email: 'marie.diop@example.com',
      password: hashedPassword,
      lastname: 'Diop',
      firstname: 'Marie',
      phoneNumber: '+221771234568',
      gender: 'FEMALE',
      address: 'Plateau, Dakar',
      photoUrl: 'https://ui-avatars.com/api/?name=Marie+Diop&background=E91E63&color=fff&size=200',
      credit: 5000,
      roles: {
        connect: [{ id: roleSimple.id }],
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'ibrahima.fall@example.com' },
    update: {},
    create: {
      email: 'ibrahima.fall@example.com',
      password: hashedPassword,
      lastname: 'Fall',
      firstname: 'Ibrahima',
      phoneNumber: '+221771234569',
      gender: 'MALE',
      address: 'Almadies, Dakar',
      photoUrl: 'https://ui-avatars.com/api/?name=Ibrahima+Fall&background=2196F3&color=fff&size=200',
      credit: 3000,
      roles: {
        connect: [{ id: roleSimple.id }],
      },
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'fatou.seck@example.com' },
    update: {},
    create: {
      email: 'fatou.seck@example.com',
      password: hashedPassword,
      lastname: 'Seck',
      firstname: 'Fatou',
      phoneNumber: '+221771234570',
      gender: 'FEMALE',
      address: 'Mermoz, Dakar',
      photoUrl: 'https://ui-avatars.com/api/?name=Fatou+Seck&background=9C27B0&color=fff&size=200',
      credit: 7500,
      roles: {
        connect: [{ id: roleSimple.id }],
      },
    },
  });

  console.log('✅ Users created');

  // ==================== UNITS ====================
  console.log('Creating units...');
  const unitMeter = await prisma.unit.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Mètre' },
  });

  const unitSpool = await prisma.unit.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Bobine' },
  });

  const unitPiece = await prisma.unit.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Pièce' },
  });

  const unitKg = await prisma.unit.upsert({
    where: { id: 4 },
    update: {},
    create: { name: 'Kilogramme' },
  });

  console.log('✅ Units created');

  // ==================== CONVERSIONS ====================
  console.log('Creating conversions...');
  await prisma.conversion.upsert({
    where: { id: 1 },
    update: {},
    create: {
      fromUnitId: unitMeter.id,
      toUnitId: unitMeter.id,
      value: 1,
    },
  });

  console.log('✅ Conversions created');

  // ==================== CATEGORIES ====================
  console.log('Creating categories...');
  const categoryFabric = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Tissus',
      image: 'https://picsum.photos/seed/fabric/400/300',
      unitId: unitMeter.id,
    },
  });

  const categoryThread = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Fils',
      image: 'https://picsum.photos/seed/thread/400/300',
      unitId: unitSpool.id,
    },
  });

  const categoryNeedle = await prisma.category.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Aiguilles',
      image: 'https://picsum.photos/seed/needle/400/300',
      unitId: unitPiece.id,
    },
  });

  const categoryButton = await prisma.category.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Boutons',
      image: 'https://picsum.photos/seed/button/400/300',
      unitId: unitPiece.id,
    },
  });

  console.log('✅ Categories created');

  // ==================== TAGS ====================
  console.log('Creating tags...');
  const tagModerne = await prisma.tag.upsert({
    where: { name: 'Moderne' },
    update: {},
    create: { name: 'Moderne' },
  });

  const tagTraditionnel = await prisma.tag.upsert({
    where: { name: 'Traditionnel' },
    update: {},
    create: { name: 'Traditionnel' },
  });

  const tagElegant = await prisma.tag.upsert({
    where: { name: 'Élégant' },
    update: {},
    create: { name: 'Élégant' },
  });

  const tagCasual = await prisma.tag.upsert({
    where: { name: 'Casual' },
    update: {},
    create: { name: 'Casual' },
  });

  const tagCouture = await prisma.tag.upsert({
    where: { name: 'Couture' },
    update: {},
    create: { name: 'Couture' },
  });

  console.log('✅ Tags created');

  // ==================== ARTICLES ====================
  console.log('Creating articles...');
  const article1 = await prisma.article.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Coton imprimé Wax',
      stockQuantity: 50,
      unitPrice: 10.0,
      photo: 'https://picsum.photos/seed/wax-fabric/600/400',
      color: 'Multicolore',
      userId: user1.id,
      categoryId: categoryFabric.id,
      tags: {
        connect: [{ id: tagTraditionnel.id }, { id: tagElegant.id }],
      },
    },
  });

  const article2 = await prisma.article.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Fil polyester résistant',
      stockQuantity: 100,
      unitPrice: 2.5,
      photo: 'https://picsum.photos/seed/polyester/600/400',
      color: 'Blanc',
      userId: user1.id,
      categoryId: categoryThread.id,
      tags: {
        connect: [{ id: tagCouture.id }],
      },
    },
  });

  const article3 = await prisma.article.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Aiguilles à coudre professionnelles',
      stockQuantity: 200,
      unitPrice: 1.0,
      photo: 'https://picsum.photos/seed/needles/600/400',
      color: 'Argent',
      userId: user2.id,
      categoryId: categoryNeedle.id,
      tags: {
        connect: [{ id: tagCouture.id }],
      },
    },
  });

  const article4 = await prisma.article.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Tissu Bazin Riche',
      stockQuantity: 30,
      unitPrice: 25.0,
      photo: 'https://picsum.photos/seed/bazin/600/400',
      color: 'Bleu royal',
      userId: user2.id,
      categoryId: categoryFabric.id,
      tags: {
        connect: [{ id: tagTraditionnel.id }, { id: tagElegant.id }],
      },
    },
  });

  const article5 = await prisma.article.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: 'Boutons dorés décoratifs',
      stockQuantity: 500,
      unitPrice: 0.5,
      photo: 'https://picsum.photos/seed/buttons/600/400',
      color: 'Doré',
      userId: user3.id,
      categoryId: categoryButton.id,
      tags: {
        connect: [{ id: tagElegant.id }],
      },
    },
  });

  console.log('✅ Articles created');

  // ==================== POSTS ====================
  console.log('Creating posts...');
  const post1 = await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content: 'https://picsum.photos/seed/dress1/800/1000',
      description: 'Magnifique robe en Wax pour les grandes occasions! Disponible sur commande.',
      authorId: user1.id,
      views: 150,
      nbFavorites: 12,
      tag: {
        connect: [{ id: tagTraditionnel.id }, { id: tagElegant.id }],
      },
    },
  });

  const post2 = await prisma.post.upsert({
    where: { id: 2 },
    update: {},
    create: {
      content: 'https://picsum.photos/seed/outfit1/800/1000',
      description: 'Tenue moderne et élégante pour homme. Parfait pour les événements professionnels.',
      authorId: user2.id,
      views: 200,
      nbFavorites: 25,
      tag: {
        connect: [{ id: tagModerne.id }, { id: tagElegant.id }],
      },
    },
  });

  const post3 = await prisma.post.upsert({
    where: { id: 3 },
    update: {},
    create: {
      content: 'https://picsum.photos/seed/casual/800/1000',
      description: 'Collection casual pour le quotidien. Confort et style garantis!',
      authorId: user3.id,
      views: 95,
      nbFavorites: 8,
      tag: {
        connect: [{ id: tagCasual.id }, { id: tagModerne.id }],
      },
    },
  });

  console.log('✅ Posts created');

  // ==================== COMMENTS ====================
  console.log('Creating comments...');
  await prisma.comment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content: 'Très belle création! Quel est le prix?',
      authorId: user2.id,
      postId: post1.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      content: 'J\'adore le style! Où peut-on commander?',
      authorId: user3.id,
      postId: post1.id,
    },
  });

  console.log('✅ Comments created');

  // ==================== RATES ====================
  console.log('Creating rates...');
  await prisma.rate.upsert({
    where: { id: 1 },
    update: {},
    create: {
      stars: 5,
      description: 'Excellent travail, très professionnel!',
      postId: post1.id,
      userId: user2.id,
    },
  });

  await prisma.rate.upsert({
    where: { id: 2 },
    update: {},
    create: {
      stars: 4.5,
      description: 'Très beau design, j\'aime beaucoup!',
      postId: post2.id,
      userId: user1.id,
    },
  });

  console.log('✅ Rates created');

  // ==================== LIKES ====================
  console.log('Creating likes...');
  await prisma.postLike.upsert({
    where: { id: 1 },
    update: {},
    create: {
      postId: post1.id,
      userId: user2.id,
    },
  });

  await prisma.postLike.upsert({
    where: { id: 2 },
    update: {},
    create: {
      postId: post1.id,
      userId: user3.id,
    },
  });

  await prisma.postLike.upsert({
    where: { id: 3 },
    update: {},
    create: {
      postId: post2.id,
      userId: user1.id,
    },
  });

  console.log('✅ Likes created');

  // ==================== FAVORITES ====================
  console.log('Creating favorites...');
  await prisma.favorite.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user2.id,
      postId: post1.id,
    },
  });

  await prisma.favorite.upsert({
    where: { id: 2 },
    update: {},
    create: {
      userId: user3.id,
      postId: post2.id,
    },
  });

  console.log('✅ Favorites created');

  // ==================== USER FOLLOWS ====================
  console.log('Creating user follows...');
  await prisma.userFollow.upsert({
    where: { id: 1 },
    update: {},
    create: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  await prisma.userFollow.upsert({
    where: { id: 2 },
    update: {},
    create: {
      followerId: user3.id,
      followingId: user1.id,
    },
  });

  await prisma.userFollow.upsert({
    where: { id: 3 },
    update: {},
    create: {
      followerId: user1.id,
      followingId: user2.id,
    },
  });

  console.log('✅ User follows created');

  // ==================== MEASUREMENTS ====================
  console.log('Creating measurements...');
  await prisma.femaleMeasurement.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user1.id,
      shoulder: 38.5,
      chest: 92.0,
      waist: 70.0,
      hips: 98.0,
      bust: 88.0,
      inseam: 78.0,
      thigh: 56.0,
    },
  });

  await prisma.femaleMeasurement.upsert({
    where: { id: 2 },
    update: {},
    create: {
      userId: user3.id,
      shoulder: 36.0,
      chest: 86.0,
      waist: 65.0,
      hips: 92.0,
      bust: 84.0,
      inseam: 76.0,
      thigh: 52.0,
    },
  });

  await prisma.maleMeasurement.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user2.id,
      shoulder: 45.0,
      chest: 102.0,
      waist: 85.0,
      hips: 98.0,
      sleeveLength: 62.0,
      neck: 40.0,
      back: 48.0,
      armhole: 46.0,
      thigh: 60.0,
      calf: 38.0,
    },
  });

  console.log('✅ Measurements created');

  // ==================== RECHARGES ====================
  console.log('Creating recharges...');
  await prisma.recharge.upsert({
    where: { code: BigInt('1234567890123456') },
    update: {},
    create: {
      userId: adminUser.id,
      code: BigInt('1234567890123456'),
      amount: 5000,
      isUsed: false,
    },
  });

  await prisma.recharge.upsert({
    where: { code: BigInt('9876543210987654') },
    update: {},
    create: {
      userId: adminUser.id,
      receiverId: user1.id,
      code: BigInt('9876543210987654'),
      amount: 2000,
      isUsed: true,
    },
  });

  console.log('✅ Recharges created');

  // ==================== STORIES ====================
  console.log('Creating stories...');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  await prisma.story.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content: 'https://picsum.photos/seed/story1/1080/1920',
      description: 'Nouvelle collection disponible!',
      authorId: user1.id,
      expiresAt: expiresAt,
    },
  });

  console.log('✅ Stories created');

  // ==================== NOTIFICATIONS ====================
  console.log('Creating notifications...');
  await prisma.notification.upsert({
    where: { id: 1 },
    update: {},
    create: {
      receiverId: user1.id,
      emetorId: user2.id,
      content: 'a aimé votre publication',
      type: 'LIKE',
      postId: post1.id,
      isRead: false,
    },
  });

  await prisma.notification.upsert({
    where: { id: 2 },
    update: {},
    create: {
      receiverId: user1.id,
      emetorId: user3.id,
      content: 'a commenté votre publication',
      type: 'COMMENT',
      postId: post1.id,
      isRead: false,
    },
  });

  await prisma.notification.upsert({
    where: { id: 3 },
    update: {},
    create: {
      receiverId: user1.id,
      emetorId: user2.id,
      content: 'a commencé à vous suivre',
      type: 'FOLLOW',
      isRead: true,
    },
  });

  console.log('✅ Notifications created');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
