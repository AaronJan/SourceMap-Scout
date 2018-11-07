import { IsString, IsInt, Length, Min } from 'class-validator';

export class ScoutPayload {
    @IsString()
    @Length(1, 100)
    readonly file: string;

    @IsInt()
    @Min(1)
    readonly line: number;

    @IsInt()
    @Min(0)
    readonly column: number;
}
