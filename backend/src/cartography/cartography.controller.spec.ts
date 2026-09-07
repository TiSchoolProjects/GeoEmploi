import { Test, TestingModule } from '@nestjs/testing';
import { CartographyController } from './cartography.controller';
import { CartographyService } from './cartography.service';

describe('CartographyController', () => {
  let controller: CartographyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartographyController],
      providers: [CartographyService],
    }).compile();

    controller = module.get<CartographyController>(CartographyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
