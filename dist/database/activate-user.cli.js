"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const user_schema_1 = require("../modules/users/user.schema");
const plan_schema_1 = require("../modules/plans/plan.schema");
const wallet_schema_1 = require("../modules/wallet/schemas/wallet.schema");
const app_constants_1 = require("../common/constants/app.constants");
const TARGET = {
    name: 'start success',
    email: 'startsuccessss@gmail.com',
    phone: '9669132909',
    tierId: 'premium',
    amount: 7999,
};
async function generateUniqueReferralCode(userModel) {
    for (let i = 0; i < 8; i++) {
        const code = (0, uuid_1.v4)().replace(/-/g, '').slice(0, 10).toUpperCase();
        const exists = await userModel.exists({ referralCode: code });
        if (!exists)
            return code;
    }
    throw new Error('Could not generate referral code');
}
async function run() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userModel = app.get((0, mongoose_1.getModelToken)(user_schema_1.User.name));
    const planModel = app.get((0, mongoose_1.getModelToken)(plan_schema_1.Plan.name));
    const walletModel = app.get((0, mongoose_1.getModelToken)(wallet_schema_1.Wallet.name));
    const plan = await planModel.findOne({ tierId: TARGET.tierId, active: { $ne: false } }).exec();
    if (!plan) {
        throw new Error(`Plan not found for tierId "${TARGET.tierId}"`);
    }
    const email = TARGET.email.toLowerCase().trim();
    const tempPassword = (0, uuid_1.v4)().slice(0, 12);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    let user = await userModel.findOne({ email }).exec();
    const isNew = !user;
    if (user) {
        user.name = TARGET.name;
        user.phone = TARGET.phone;
        user.planId = plan._id;
        user.accountActive = true;
        user.password = passwordHash;
        user.emailVerified = true;
        if (!user.referralCode) {
            user.referralCode = await generateUniqueReferralCode(userModel);
        }
        await user.save();
    }
    else {
        const referralCode = await generateUniqueReferralCode(userModel);
        user = await userModel.create({
            name: TARGET.name,
            email,
            phone: TARGET.phone,
            password: passwordHash,
            referralCode,
            role: app_constants_1.UserRole.USER,
            emailVerified: true,
            accountActive: true,
            planId: plan._id,
        });
    }
    const wallet = await walletModel.findOne({ userId: user._id }).exec();
    if (!wallet) {
        await walletModel.create({ userId: user._id, balance: 0, pendingBalance: 0 });
    }
    console.log(JSON.stringify({
        ok: true,
        action: isNew ? 'created' : 'updated',
        userId: user._id.toString(),
        email,
        name: TARGET.name,
        phone: TARGET.phone,
        plan: plan.name,
        tierId: plan.tierId,
        amountPaid: TARGET.amount,
        accountActive: true,
        referralCode: user.referralCode,
        tempPassword,
        loginUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    }, null, 2));
    await app.close();
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=activate-user.cli.js.map