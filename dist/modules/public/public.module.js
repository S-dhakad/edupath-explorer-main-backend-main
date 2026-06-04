"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const landing_hero_schema_1 = require("./schemas/landing-hero.schema");
const landing_pricing_schema_1 = require("./schemas/landing-pricing.schema");
const course_schema_1 = require("../courses/course.schema");
const category_schema_1 = require("../categories/category.schema");
const public_service_1 = require("./public.service");
const public_controller_1 = require("./public.controller");
const auth_module_1 = require("../auth/auth.module");
const plans_module_1 = require("../plans/plans.module");
const users_module_1 = require("../users/users.module");
let PublicModule = class PublicModule {
};
exports.PublicModule = PublicModule;
exports.PublicModule = PublicModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: landing_hero_schema_1.LandingHero.name, schema: landing_hero_schema_1.LandingHeroSchema },
                { name: landing_pricing_schema_1.LandingPricing.name, schema: landing_pricing_schema_1.LandingPricingSchema },
                { name: course_schema_1.Course.name, schema: course_schema_1.CourseSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
            ]),
            auth_module_1.AuthModule,
            plans_module_1.PlansModule,
            users_module_1.UsersModule,
        ],
        controllers: [public_controller_1.PublicController, public_controller_1.LandingAdminController],
        providers: [public_service_1.PublicService],
        exports: [public_service_1.PublicService],
    })
], PublicModule);
//# sourceMappingURL=public.module.js.map