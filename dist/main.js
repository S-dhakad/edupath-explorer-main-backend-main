"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    const config = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use((0, compression_1.default)());
    app.use((0, express_mongo_sanitize_1.default)());
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.enableCors({
        origin: config.get('cors.origin'),
        credentials: true,
    });
    const uploadDirName = config.get('media.uploadDir') || 'uploads';
    const uploadRoot = (0, node_path_1.join)(process.cwd(), uploadDirName);
    const videosDir = (0, node_path_1.join)(uploadRoot, 'videos');
    const kycDir = (0, node_path_1.join)(uploadRoot, 'kyc');
    const mediaDir = (0, node_path_1.join)(uploadRoot, 'media');
    if (!(0, node_fs_1.existsSync)(videosDir)) {
        (0, node_fs_1.mkdirSync)(videosDir, { recursive: true });
    }
    if (!(0, node_fs_1.existsSync)(kycDir)) {
        (0, node_fs_1.mkdirSync)(kycDir, { recursive: true });
    }
    if (!(0, node_fs_1.existsSync)(mediaDir)) {
        (0, node_fs_1.mkdirSync)(mediaDir, { recursive: true });
    }
    app.useStaticAssets(uploadRoot, { prefix: '/uploads/' });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('EduPath Affiliate API')
        .setDescription('Production backend for course marketplace, wallets, referrals, and admin.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`API http://localhost:${port}  Swagger /api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map