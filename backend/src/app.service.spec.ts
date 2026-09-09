import { AppService } from './app.service';

describe('AppService', () => {
  it('retourne le message de santé', () => {
    expect(new AppService().getHello()).toBe('Hello World !');
  });
});

