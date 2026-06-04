"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const configuration_1 = __importDefault(require("./config/configuration"));
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const courses_module_1 = require("./modules/courses/courses.module");
const purchases_module_1 = require("./modules/purchases/purchases.module");
const watching_module_1 = require("./modules/watching/watching.module");
const plans_module_1 = require("./modules/plans/plans.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const settings_module_1 = require("./modules/settings/settings.module");
const commission_module_1 = require("./modules/commission/commission.module");
const affiliate_module_1 = require("./modules/affiliate/affiliate.module");
const categories_module_1 = require("./modules/categories/categories.module");
const withdrawals_module_1 = require("./modules/withdrawals/withdrawals.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const payment_module_1 = require("./modules/payment/payment.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const admin_module_1 = require("./modules/admin/admin.module");
const coupons_module_1 = require("./modules/coupons/coupons.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const banners_module_1 = require("./modules/banners/banners.module");
const public_module_1 = require("./modules/public/public.module");
const kyc_module_1 = require("./modules/kyc/kyc.module");
const mail_module_1 = require("./modules/mail/mail.module");
const plan_sales_module_1 = require("./modules/plan-sales/plan-sales.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mail_module_1.MailModule,
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [configuration_1.default] }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 200,
                },
            ]),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    uri: config.get('mongodb.uri'),
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            courses_module_1.CoursesModule,
            purchases_module_1.PurchasesModule,
            watching_module_1.WatchingModule,
            plans_module_1.PlansModule,
            wallet_module_1.WalletModule,
            settings_module_1.SettingsModule,
            commission_module_1.CommissionModule,
            affiliate_module_1.AffiliateModule,
            categories_module_1.CategoriesModule,
            withdrawals_module_1.WithdrawalsModule,
            notifications_module_1.NotificationsModule,
            payment_module_1.PaymentModule,
            analytics_module_1.AnalyticsModule,
            admin_module_1.AdminModule,
            coupons_module_1.CouponsModule,
            reviews_module_1.ReviewsModule,
            banners_module_1.BannersModule,
            public_module_1.PublicModule,
            kyc_module_1.KycModule,
            plan_sales_module_1.PlanSalesModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map