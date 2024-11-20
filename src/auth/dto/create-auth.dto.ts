import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength, registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsEqualTo(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isEqualTo',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const relatedValue = (args.object as any)[args.constraints[0]];
                    return value === relatedValue;
                },
            },
        });
    };
}

//------------------------------------------

export class CreateAuthDto {

    @ApiProperty({
        example: "john@google.com",
        description: "CreateAuthDto Email"
    })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "Abc123",
        description: "CreateAuthDto Password"
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/,
        { message: 'The password must have a uppercase, lowercase letter and a number' }
    )
    password: string;

    @ApiProperty({
        example: "Abc123",
        description: "CreateAuthDto Password Confirm"
    })
    @IsString()
    @IsEqualTo('password', { message: 'Password confirmation does not match with password' })
    passwordConfirm: string;

    @ApiProperty({
        example: ["user"],
        description: "CreateAuthDto Roles"
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    roles?: string[];

}
