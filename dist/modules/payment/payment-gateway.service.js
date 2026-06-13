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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PaymentGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto = __importStar(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
const payment_schema_1 = require("./schemas/payment.schema");
const app_constants_1 = require("../../common/constants/app.constants");
let PaymentGatewayService = PaymentGatewayService_1 = class PaymentGatewayService {
    constructor(config, paymentModel) {
        this.config = config;
        this.paymentModel = paymentModel;
        this.logger = new common_1.Logger(PaymentGatewayService_1.name);
        this.razorpayClient = null;
    }
    isRazorpayConfigured() {
        return Boolean(this.config.get('razorpay.keyId') &&
            this.config.get('razorpay.keySecret'));
    }
    getRazorpayClient() {
        if (this.razorpayClient)
            return this.razorpayClient;
        const keyId = this.config.get('razorpay.keyId');
        const keySecret = this.config.get('razorpay.keySecret');
        if (!keyId || !keySecret) {
            throw new common_1.BadRequestException('Razorpay is not configured');
        }
        this.razorpayClient = new razorpay_1.default({ key_id: keyId, key_secret: keySecret });
        return this.razorpayClient;
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
        const keyId = this.config.get('razorpay.keyId');
        const doc = await this.paymentModel.create({
            payerUserId: new mongoose_2.Types.ObjectId(payerUserId),
            courseId: opts.courseId ? new mongoose_2.Types.ObjectId(opts.courseId) : null,
            planId: opts.planId ? new mongoose_2.Types.ObjectId(opts.planId) : null,
            couponCode: opts.couponCode,
            amount,
            currency: 'INR',
            provider: 'razorpay',
            status: keyId ? app_constants_1.PaymentStatus.PENDING : app_constants_1.PaymentStatus.COMPLETED,
            externalId: keyId ? '' : `mock_rzp_${Date.now()}`,
        });
        if (!this.isRazorpayConfigured()) {
            const paymentMock = this.config.get('razorpay.paymentMock') === true;
            if (!paymentMock) {
                throw new common_1.BadRequestException('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend .env, then restart the server.');
            }
            return {
                payment: doc,
                keyId: null,
                orderId: doc.externalId,
                amount: Math.round(amount * 100),
                message: 'Razorpay keys missing — mock completed (RAZORPAY_PAYMENT_MOCK=true)',
            };
        }
        try {
            const rzp = this.getRazorpayClient();
            const order = await rzp.orders.create({
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: doc._id.toString(),
                notes: {
                    paymentId: doc._id.toString(),
                    payerUserId,
                    planId: opts.planId ?? '',
                    courseId: opts.courseId ?? '',
                },
            });
            doc.externalId = order.id;
            await doc.save();
            return {
                payment: doc,
                keyId,
                orderId: order.id,
                amount: order.amount,
                message: 'Use Razorpay checkout with this order id',
            };
        }
        catch (err) {
            await this.paymentModel.findByIdAndDelete(doc._id).exec();
            const msg = err?.error?.description || err?.message || 'Failed to create Razorpay order';
            this.logger.error(`Razorpay order create failed: ${msg}`);
            throw new common_1.BadRequestException(msg);
        }
    }
    verifyPaymentSignature(orderId, razorpayPaymentId, signature) {
        const secret = this.config.get('razorpay.keySecret');
        if (!secret)
            return false;
        const expected = crypto
            .createHmac('sha256', secret)
            .update(`${orderId}|${razorpayPaymentId}`)
            .digest('hex');
        return expected === signature;
    }
    verifyWebhookSignature(body, signature) {
        const secret = this.config.get('razorpay.webhookSecret');
        if (!secret)
            return true;
        try {
            const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
            return expected === signature;
        }
        catch {
            return false;
        }
    }
    async confirmRazorpayPayment(dto) {
        const pay = await this.paymentModel.findById(dto.paymentId).exec();
        if (!pay)
            throw new common_1.BadRequestException('Payment not found');
        if (pay.provider !== 'razorpay') {
            throw new common_1.BadRequestException('Not a Razorpay payment');
        }
        if (pay.status === app_constants_1.PaymentStatus.COMPLETED) {
            return pay;
        }
        if (!this.isRazorpayConfigured()) {
            if (this.config.get('razorpay.paymentMock') !== true) {
                throw new common_1.BadRequestException('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend .env.');
            }
            pay.status = app_constants_1.PaymentStatus.COMPLETED;
            await pay.save();
            return pay;
        }
        if (pay.externalId !== dto.orderId) {
            throw new common_1.BadRequestException('Order id does not match this payment');
        }
        if (!this.verifyPaymentSignature(dto.orderId, dto.razorpayPaymentId, dto.signature)) {
            throw new common_1.BadRequestException('Invalid Razorpay payment signature');
        }
        pay.status = app_constants_1.PaymentStatus.COMPLETED;
        pay.providerPayload = {
            ...(pay.providerPayload ?? {}),
            razorpayOrderId: dto.orderId,
            razorpayPaymentId: dto.razorpayPaymentId,
            verifiedAt: new Date().toISOString(),
        };
        await pay.save();
        return pay;
    }
    async confirmGuestRazorpayPayment(dto) {
        const pay = await this.paymentModel.findById(dto.paymentId).lean();
        const kind = pay?.providerPayload?.checkoutKind;
        if (!pay || kind !== 'guest') {
            throw new common_1.BadRequestException('Invalid guest payment session');
        }
        return this.confirmRazorpayPayment(dto);
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