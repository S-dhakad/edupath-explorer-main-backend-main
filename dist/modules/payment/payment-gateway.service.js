"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payment_schema_1 = require("./schemas/payment.schema");
const app_constants_1 = require("../../common/constants/app.constants");
let PaymentGatewayService = PaymentGatewayService_1 = class PaymentGatewayService {
    constructor(config, paymentModel) {
        this.config = config;
        this.paymentModel = paymentModel;
        this.logger = new common_1.Logger(PaymentGatewayService_1.name);
    }
    async createStripeLikeOrder(payerUserId, amount, opts) {
        const secret = this.config.get('stripe.secretKey');
        const doc = await this.paymentModel.create({
            payerUserId: new mongoose_2.Types.ObjectId(payerUserId),
            courseId: opts.courseId ? new mongoose_2.Types.ObjectId(opts.courseId) : null,
            planId: opts.planId ? new mongoose_2.Types.ObjectId(opts.planId) : null,
            couponCode: opts.couponCode,
            amount,
            currency: 'INR',
            provider: 'stripe',
            status: secret ? app_constants_1.PaymentStatus.PENDING : app_constants_1.PaymentStatus.COMPLETED,
            externalId: secret ? `pi_${Date.now()}` : `mock_${Date.now()}`,
        });
        return {
            payment: doc,
            clientSecret: secret ? null : 'mock-no-stripe-key-configured',
            message: secret
                ? 'Configure Stripe SDK in production to return real clientSecret'
                : 'Stripe key missing — payment marked completed for local development only',
        };
    }
    async createRazorpayLikeOrder(payerUserId, amount, opts) {
        const key = this.config.get('razorpay.keyId');
        const doc = await this.paymentModel.create({
            payerUserId: new mongoose_2.Types.ObjectId(payerUserId),
            courseId: opts.courseId ? new mongoose_2.Types.ObjectId(opts.courseId) : null,
            planId: opts.planId ? new mongoose_2.Types.ObjectId(opts.planId) : null,
            couponCode: opts.couponCode,
            amount,
            currency: 'INR',
            provider: 'razorpay',
            status: key ? app_constants_1.PaymentStatus.PENDING : app_constants_1.PaymentStatus.COMPLETED,
            externalId: key ? `order_${Date.now()}` : `mock_rzp_${Date.now()}`,
        });
        return {
            payment: doc,
            keyId: key || null,
            orderId: doc.externalId,
            message: key ? 'Use Razorpay checkout with this order id' : 'Razorpay keys missing — mock completed',
        };
    }
    async markCompletedByExternal(provider, externalId) {
        return this.paymentModel
            .findOneAndUpdate({ provider, externalId, status: app_constants_1.PaymentStatus.PENDING }, { status: app_constants_1.PaymentStatus.COMPLETED }, { new: true })
            .exec();
    }
    logWebhook(provider, body) {
        this.logger.log(`Webhook ${provider}: ${JSON.stringify(body).slice(0, 500)}`);
    }
};
exports.PaymentGatewayService = PaymentGatewayService;
exports.PaymentGatewayService = PaymentGatewayService = PaymentGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Model])
], PaymentGatewayService);
//# sourceMappingURL=payment-gateway.service.js.map