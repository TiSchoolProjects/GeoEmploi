import { Injectable } from "@nestjs/common";
import proj4 from 'proj4';

@Injectable()
export class CoordinatesService {
  constructor() {
    proj4.defs('EPSG:2154','+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs',);
  }

  convertLambert(lat: number, lng: number) {
    const [x, y] = proj4('EPSG:4326', 'EPSG:2154', [lng, lat],);

    return {x: Math.round(x * 100) /100, y: Math.round(y * 100)/100,};
  }
}
