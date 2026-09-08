import { Module } from '@nestjs/common';
import { CartographyService } from './cartography.service';
import { CartographyController } from './cartography.controller';

@Module({
  controllers: [CartographyController],
  providers: [CartographyService],
})
export class CartographyModule {}
