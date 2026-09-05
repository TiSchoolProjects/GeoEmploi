import { Module } from "@nestjs/common";
import { CoordinatesService } from "./coordinates.service";

@Module({
  providers: [CoordinatesService],
  exports: [CoordinatesService],
})
export class CoordinatesModule {}
