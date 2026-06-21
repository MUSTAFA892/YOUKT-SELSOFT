import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
