// main.ts — ENTRY POINT of the NestJS backend
// This is the very first file that runs when you start the server

// dotenv reads your .env file so process.env.YOUR_KEY works everywhere in the app
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // NestFactory.create() boots up the entire application
  const app = await NestFactory.create(AppModule);

  // CORS — allows your frontend (localhost:3000) to call this backend
  // Without CORS, the browser would block the API calls
  app.enableCors({ origin: '*', methods: ['GET', 'POST'] });

  // All routes will be prefixed with /api
  // So: GET /problems becomes GET /api/problems
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  // Print all available routes so you know what to test in Postman
  console.log('\n========================================');
  console.log(`✅  Server running on http://localhost:${port}`);
  console.log('\n📌  Endpoints to test in Postman:');
  console.log(`    GET  http://localhost:${port}/api/problems`);
  console.log(`    GET  http://localhost:${port}/api/problems/1`);
  console.log(`    GET  http://localhost:${port}/api/problems/2`);
  console.log(`    GET  http://localhost:${port}/api/problems/3`);
  console.log(`    POST http://localhost:${port}/api/submissions`);
  console.log('========================================\n');
}

bootstrap();
