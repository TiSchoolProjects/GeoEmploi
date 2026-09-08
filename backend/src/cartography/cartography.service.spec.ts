import { Test, TestingModule } from '@nestjs/testing';
import { CartographyService } from './cartography.service';

describe('CartographyService', () => {
  let service: CartographyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartographyService],
    }).compile();

    service = module.get<CartographyService>(CartographyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
