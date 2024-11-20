import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data: string | string[], context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        const user = request.user

        if (!user) {
            throw new InternalServerErrorException("User not found (request)");
        }

        if (Array.isArray(data)) {
            const selectedData = {};
            data.forEach((key) => {
                if (user[key] !== undefined) {
                    selectedData[key] = user[key];
                }
            });
            return selectedData;
        }

        // Si `data` es un string, devolvemos solo esa propiedad
        if (typeof data === 'string') {
            return user[data];
        }

        return user;
    }
)