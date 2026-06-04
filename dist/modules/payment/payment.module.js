"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const payment_schema_1 = require("./schemas/payment.schema");
const payment_gateway_service_1 = require("./payment-gateway.service");
const payments_controller_1 = require("./payments.controller");
const plan_sales_module_1 = require("../plan-sales/plan-sales.module");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: payment_schema_1.Payment.name, schema: payment_schema_1.PaymentSchema }]),
            (0, common_1.forwardRef)(() => plan_sales_module_1.PlanSalesModule),
        ],
        providers: [payment_gateway_service_1.PaymentGatewayService],
        controllers: [payments_controller_1.PaymentsController],
        exports: [payment_gateway_service_1.PaymentGatewayService],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map