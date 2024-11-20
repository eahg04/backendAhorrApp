import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from "class-validator";

export class PaginationDto {

    @ApiProperty({
        default: 5, description: 'How many rows do you need'
    })
    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number;

    @ApiProperty({
        default: 0, description: 'How many rows do you want to skip'
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    offset?: number;


    @ApiProperty({
        description: 'Search for a product by title, slug or tags'
    })
    @IsOptional()
    @IsString()
    @MinLength(2)
    search?: string;
}