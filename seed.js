"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialisation des données pour la table Unit
        const unitMeter = yield prisma.unit.create({
            data: {
                name: 'Mètre',
            },
        });
        const unitSpool = yield prisma.unit.create({
            data: {
                name: 'Bobine',
            },
        });
        const unitPiece = yield prisma.unit.create({
            data: {
                name: 'Pièce',
            },
        });
        // Initialisation des données pour la table Category
        const categoryFabric = yield prisma.category.create({
            data: {
                name: 'Tissus',
                image: 'tissus.png',
                unitId: unitMeter.id, // Associée à l'unité Mètre
            },
        });
        const categoryThread = yield prisma.category.create({
            data: {
                name: 'Fils',
                image: 'fils.png',
                unitId: unitSpool.id, // Associée à l'unité Bobine
            },
        });
        const categoryNeedle = yield prisma.category.create({
            data: {
                name: 'Aiguilles',
                image: 'aiguilles.png',
                unitId: unitPiece.id, // Associée à l'unité Pièce
            },
        });
        // Initialisation des données pour la table Article
        yield prisma.article.create({
            data: {
                name: 'Coton imprimé',
                stockQuantity: 50,
                unitPrice: 10.0,
                photo: 'coton-imprime.png',
                color: 'Bleu',
                userId: 2, // Assurez-vous que l'utilisateur avec id=1 existe
                categoryId: categoryFabric.id,
            },
        });
        yield prisma.article.create({
            data: {
                name: 'Fil polyester',
                stockQuantity: 100,
                unitPrice: 2.5,
                photo: 'fil-polyester.png',
                color: 'Blanc',
                userId: 2, // Assurez-vous que l'utilisateur avec id=1 existe
                categoryId: categoryThread.id,
            },
        });
        yield prisma.article.create({
            data: {
                name: 'Aiguilles à coudre',
                stockQuantity: 200,
                unitPrice: 1.0,
                photo: 'aiguilles.png',
                color: 'Argent',
                userId: 2, // Assurez-vous que l'utilisateur avec id=1 existe
                categoryId: categoryNeedle.id,
            },
        });
        console.log('Seeding terminé.');
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}));
