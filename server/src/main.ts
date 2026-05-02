import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS Configuration
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = parseInt(process.env.PORT ?? '3000', 10) || 3000;
  try {
    await app.listen(port);
    console.log(`🔐 EMS API running on http://localhost:${port}`);
  } catch (error: any) {
    if (error?.code === 'EADDRINUSE') {
      const fallbackPort = port + 1;
      console.warn(`Port ${port} is already in use, switching to ${fallbackPort}`);
      await app.listen(fallbackPort);
      console.log(`🔐 EMS API running on http://localhost:${fallbackPort}`);
    } else {
      throw error;
    }
  }

  console.log('📱 Client: http://localhost:4200');
}
bootstrap();