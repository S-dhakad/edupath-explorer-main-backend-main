"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const admin_controller_1 = require("./admin.controller");
const users_module_1 = require("../users/users.module");
const courses_module_1 = require("../courses/courses.module");
const commission_schema_1 = require("../commission/schemas/commission.schema");
const kyc_schema_1 = require("../kyc/schemas/kyc.schema");
const withdrawal_schema_1 = require("../withdrawals/withdrawal.schema");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            users_module_1.UsersModule,
            courses_module_1.CoursesModule,
            mongoose_1.MongooseModule.forFeature([
                { name: commission_schema_1.Commission.name, schema: commission_schema_1.CommissionSchema },
                { name: kyc_schema_1.Kyc.name, schema: kyc_schema_1.KycSchema },
                { name: withdrawal_schema_1.Withdrawal.name, schema: withdrawal_schema_1.WithdrawalSchema },
            ]),
        ],
        controllers: [admin_controller_1.AdminController],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map