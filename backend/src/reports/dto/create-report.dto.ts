import { ApiProperty } from "@nestjs/swagger";
import { ReportReason } from "../entities/report.entity";
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";

export class CreateReportDto {
  @ApiProperty({enum: ReportReason, example: ReportReason.MISLEADING,})
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiProperty({example: "Cette offre demande de payer pour postuler.",})
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  description: string
}

