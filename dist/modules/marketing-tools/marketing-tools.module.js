"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingToolsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const marketing_tool_schema_1 = require("./marketing-tool.schema");
const marketing_tools_service_1 = require("./marketing-tools.service");
const marketing_tools_controller_1 = require("./marketing-tools.controller");
let MarketingToolsModule = class MarketingToolsModule {
};
exports.MarketingToolsModule = MarketingToolsModule;
exports.MarketingToolsModule = MarketingToolsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: marketing_tool_schema_1.MarketingTool.name, schema: marketing_tool_schema_1.MarketingToolSchema }])],
        providers: [marketing_tools_service_1.MarketingToolsService],
        controllers: [marketing_tools_controller_1.MarketingToolsController],
        exports: [marketing_tools_service_1.MarketingToolsService],
    })
], MarketingToolsModule);
//# sourceMappingURL=marketing-tools.module.js.map