"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] });
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/', (req, res) => {
        res.redirect('http://localhost:3000');
    });
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log('\n========================================');
    console.log(`✅  Server running on http://localhost:${port}`);
    console.log('\n📌  Key endpoints:');
    console.log(`    GET  http://localhost:${port}/api/problems`);
    console.log(`    GET  http://localhost:${port}/api/pipeline`);
    console.log(`    POST http://localhost:${port}/api/submissions`);
    console.log('========================================\n');
}
bootstrap();
//# sourceMappingURL=main.js.map