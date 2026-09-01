import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({whitelist:true, forbidNonWhitelisted: true,}));

  const config = new DocumentBuilder()
    .setTitle('API Doc')
    .setDescription('Documentation of api endpoint')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: 'http://localhost:5173',
  });
  await app.listen(process.env.PORT ?? 4242);
}
bootstrap();
