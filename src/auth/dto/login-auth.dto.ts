import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength, registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

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

export class LoginAuthDto {

    @ApiProperty({
        example: "john@google.com",
        description: "LoginUserDto Email"
    })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "Abc123",
        description: "LoginUserDto Password"
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @ApiProperty({
        example: "Abc123",
        description: "LoginUserDto Password"
    })
    @IsString()
    @IsEqualTo('password', {
        message: 'Password confirmation does not match with password',
    })
    passwordConfirm: string
}