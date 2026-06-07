/**
 * One-off: activate a user with a membership plan.
 * Run: npx ts-node -r tsconfig-paths/register src/database/activate-user.cli.ts
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from '../modules/users/user.schema';
import { Plan, PlanDocument } from '../modules/plans/plan.schema';
import { Wallet, WalletDocument } from '../modules/wallet/schemas/wallet.schema';
import { UserRole } from '../common/constants/app.constants';

const TARGET = {
  name: 'start success',
  email: 'startsuccessss@gmail.com',
  phone: '9669132909',
  tierId: 'premium',
  amount: 7999,
};

async function generateUniqueReferralCode(userModel: Model<UserDocument>) {
  for (let i = 0; i < 8; i++) {
    const code = uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase();
    const exists = await userModel.exists({ referralCode: code });
    if (!exists) return code;
  }
  throw new Error('Could not generate referral code');
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const planModel = app.get<Model<PlanDocument>>(getModelToken(Plan.name));
  const walletModel = app.get<Model<WalletDocument>>(getModelToken(Wallet.name));

  const plan = await planModel.findOne({ tierId: TARGET.tierId, active: { $ne: false } }).exec();
  if (!plan) {
    throw new Error(`Plan not found for tierId "${TARGET.tierId}"`);
  }

  const email = TARGET.email.toLowerCase().trim();
  const tempPassword = uuidv4().slice(0, 12);
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
  } else {
    const referralCode = await generateUniqueReferralCode(userModel);
    user = await userModel.create({
      name: TARGET.name,
      email,
      phone: TARGET.phone,
      password: passwordHash,
      referralCode,
      role: UserRole.USER,
      emailVerified: true,
      accountActive: true,
      planId: plan._id,
    });
  }

  const wallet = await walletModel.findOne({ userId: user._id }).exec();
  if (!wallet) {
    await walletModel.create({ userId: user._id, balance: 0, pendingBalance: 0 });
  }

  // eslint-disable-next-line no-console
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
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
