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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_gateway_service_1 = require("./payment-gateway.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const plan_sales_service_1 = require("../plan-sales/plan-sales.service");
let PaymentsController = class PaymentsController {
    constructor(payments, planSales) {
        this.payments = payments;
        this.planSales = planSales;
    }
    stripeOrder(req, body) {
        return this.payments.createStripeLikeOrder(req.user._id.toString(), body.amount, {
            courseId: body.courseId,
            planId: body.planId,
            couponCode: body.couponCode,
        });
    }
    rzpOrder(req, body) {
        return this.payments.createRazorpayLikeOrder(req.user._id.toString(), body.amount, {
            courseId: body.courseId,
            planId: body.planId,
            couponCode: body.couponCode,
        });
    }
    stripeWebhook(req, sig) {
        this.payments.logWebhook('stripe', { sig, body: req.body });
        return { received: true };
    }
    async rzpWebhook(body) {
        this.payments.logWebhook('razorpay', body);
        const orderId = body?.payload?.payment?.entity?.order_id ||
            body?.payload?.order?.entity?.id ||
            body?.order_id;
        if (orderId) {
            const pay = await this.payments.markCompletedByExternal('razorpay', orderId);
            if (pay?.planId) {
                try {
                    await this.planSales.completeSaleByPaymentId(pay._id.toString());
                }
                catch {
                }
            }
        }
        return { received: true };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('stripe/order'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "stripeOrder", null);
__decorate([
    (0, common_1.Post)('razorpay/order'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "rzpOrder", null);
__decorate([
    (0, common_1.Post)('webhook/stripe'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "stripeWebhook", null);
__decorate([
    (0, common_1.Post)('webhook/razorpay'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "rzpWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => plan_sales_service_1.PlanSalesService))),
    __metadata("design:paramtypes", [payment_gateway_service_1.PaymentGatewayService,
        plan_sales_service_1.PlanSalesService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map