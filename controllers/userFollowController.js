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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowedUsersbis = exports.getFollowedUsers = exports.getUnfollowedTailors = exports.unfollowUser = exports.followUser = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const notificationController_1 = __importDefault(require("./notificationController"));
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const followerId = req.userId; // le suiveur(celui qui suit)
    const { followingId } = req.params; // le suivi(celui qu'on est entrain de suivre)
    try {
        if (!followerId) {
            return res.status(401).json({ message: 'UserId from token not found' });
        }
        const userFollower = yield db_config_1.default.user.findUnique({
            where: { id: followerId }
        });
        if (!userFollower) {
            return res.status(404).json({ message: `User with ID ${followerId} not found` });
        }
        if (!followingId) {
            return res.status(404).json({ message: "User(Follower) following ID not present" });
        }
        const userFollowing = yield db_config_1.default.user.findUnique({
            where: { id: parseInt(followingId) }
        });
        if (!userFollowing) {
            return res.status(404).json({ message: `User(Following) with ID ${followingId} not found` });
        }
        // Vérifier si l'utilisateur n'est pas déjà dans la liste des followings
        const existingFollow = yield db_config_1.default.userFollow.findFirst({
            where: {
                followerId: followerId,
                followingId: parseInt(followingId)
            }
        });
        if (existingFollow) {
            return res.status(400).json({ message: 'You are already following this user.' });
        }
        // Créer la relation de suivi (d'abonnements)
        const follow = yield db_config_1.default.userFollow.create({
            data: {
                follower: { connect: { id: followerId } },
                following: { connect: { id: parseInt(followingId) } }
            }
        });
        yield (0, notificationController_1.default)(userFollowing.id, followerId, 'vient de vous suivre', "FOLLOW");
        res.status(201).json({ message: 'Successfully followed the user', follow });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to follow user', error });
    }
});
exports.followUser = followUser;
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const followerId = req.userId;
    const { followingId } = req.params;
    try {
        if (!followerId) {
            return res.status(401).json({ message: 'You are not authorized to unfollow users.' });
        }
        // Supprimer la relation de suivi(desabonnement)
        const unfollow = yield db_config_1.default.userFollow.deleteMany({
            where: {
                followerId: followerId,
                followingId: parseInt(followingId)
            }
        });
        if (unfollow.count === 0) {
            return res.status(404).json({ message: 'You are not following this user.' });
        }
        res.status(200).json({ message: 'Successfully unfollowed the user byeeeeeeeeeeeeee' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to unfollow user soryyyyyyyyyyyyyyyy', error });
    }
});
exports.unfollowUser = unfollowUser;
const getUnfollowedTailors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const followerId = req.userId; // Assuming you have middleware setting userId from token
    try {
        if (!followerId) {
            return res.status(401).json({ message: 'Unauthorized access.' });
        }
        // Fetch all tailors who are not already followed by the current user
        const tailors = yield db_config_1.default.user.findMany({
            where: {
                roles: { some: { name: 'TAILOR' } }, // Filter by TAILOR role
                id: { not: followerId }, // Exclude the current user
                followings: {
                    none: { followerId }, // Exclude those already followed by the current user
                }
            }
        });
        return res.status(200).json({ users: tailors });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch unfollowed tailors.', error });
    }
});
exports.getUnfollowedTailors = getUnfollowedTailors;
const getFollowedUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const followerId = req.userId; // L'ID de l'utilisateur connecté
    try {
        if (!followerId) {
            return res.status(401).json({ message: 'Unauthorized access.' });
        }
        // Récupérer les utilisateurs suivis par l'utilisateur connecté
        const followedUsers = yield db_config_1.default.user.findMany({
            where: {
                followings: {
                    some: {
                        followerId: followerId, // Utilisez followerId pour trouver les suivis
                    }
                }
            },
            include: {
                roles: true, // Inclure les rôles si nécessaire
            }
        });
        res.status(200).json({ users: followedUsers });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch followed users.', error });
    }
});
exports.getFollowedUsers = getFollowedUsers;
const getFollowedUsersbis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const followerId = parseInt(req.params.userId); // Conversion en nombre
    try {
        if (!followerId) {
            return res.status(401).json({ message: 'Unauthorized access.' });
        }
        // Récupérer les utilisateurs suivis par l'utilisateur connecté
        const followedUsers = yield db_config_1.default.user.findMany({
            where: {
                followings: {
                    some: {
                        followerId: followerId, // Utilisez followerId pour trouver les suivis
                    }
                }
            },
            include: {
                roles: true, // Inclure les rôles si nécessaire
            }
        });
        res.status(200).json({ users: followedUsers });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch followed users.', error });
    }
});
exports.getFollowedUsersbis = getFollowedUsersbis;
