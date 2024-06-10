import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger('main');
  const app = await NestFactory.create(AppModule);
  const port = 5000;
  await app.listen(port);
  const configService = app.get(ConfigService);
  const target = configService.get<string>('GOOGLE_TARGET_URL');
  logger.log(`Application is running on port: ${port}`);
  // console.log(`Application is running ${process.env.GOOGLE_TARGET_URL}`);
  // console.log(`Application is running ${target}`);
}
bootstrap();
