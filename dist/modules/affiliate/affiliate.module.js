"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const commission_schema_1 = require("../commission/schemas/commission.schema");
const user_schema_1 = require("../users/user.schema");
const users_module_1 = require("../users/users.module");
const affiliate_controller_1 = require("./affiliate.controller");
let AffiliateModule = class AffiliateModule {
};
exports.AffiliateModule = AffiliateModule;
exports.AffiliateModule = AffiliateModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: commission_schema_1.Commission.name, schema: commission_schema_1.CommissionSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            users_module_1.UsersModule,
        ],
        controllers: [affiliate_controller_1.AffiliateController],
    })
], AffiliateModule);
//# sourceMappingURL=affiliate.module.js.map