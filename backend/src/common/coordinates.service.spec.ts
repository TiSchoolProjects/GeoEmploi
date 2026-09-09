import { CoordinatesService } from './coordinates.service';

describe('CoordinatesService', () => {
  const service = new CoordinatesService();
  it('convertit du WGS84 vers Lambert-93 EPSG:2154', () => {
    const result = service.convertLambert(47.873569, 1.911358);

    expect(result.x).toBeCloseTo(618618.42, 1);
    expect(result.y).toBeCloseTo(6753135.96, 1);
  });
  it('should convert Paris to Lambert-93', () => {
    const result =
      service.convertLambert(
        48.8566,
        2.3522,
      );

    expect(result.x).toBeDefined();
    expect(result.y).toBeDefined();
  });

  it('should return numeric coordinates', () => {
    const result =
      service.convertLambert(
        47.873569,
        1.911358,
      );

    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
  });

  it('should produce positive Lambert values for France', () => {
    const result =
      service.convertLambert(
        48.8566,
        2.3522,
      );

    expect(result.x).toBeGreaterThan(0);
    expect(result.y).toBeGreaterThan(0);
  });

  it('should return stable conversion', () => {
    const a =
      service.convertLambert(
        48.8566,
        2.3522,
      );

    const b =
      service.convertLambert(
        48.8566,
        2.3522,
      );

    expect(a).toEqual(b);
  });

  it('should convert Orleans coordinates', () => {
    const result =
      service.convertLambert(
        47.873569,
        1.911358,
      );

    expect(result.x)
      .toBeCloseTo(618618.42, 0);

    expect(result.y)
      .toBeCloseTo(6753135.96, 0);
  });
});
