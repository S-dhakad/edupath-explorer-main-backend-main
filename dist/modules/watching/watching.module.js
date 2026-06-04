"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const watching_service_1 = require("./watching.service");
const watching_controller_1 = require("./watching.controller");
const watching_schema_1 = require("./watching.schema");
let WatchingModule = class WatchingModule {
};
exports.WatchingModule = WatchingModule;
exports.WatchingModule = WatchingModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: watching_schema_1.Watching.name, schema: watching_schema_1.WatchingSchema }])],
        controllers: [watching_controller_1.WatchingController],
        providers: [watching_service_1.WatchingService],
        exports: [watching_service_1.WatchingService],
    })
], WatchingModule);
//# sourceMappingURL=watching.module.js.map