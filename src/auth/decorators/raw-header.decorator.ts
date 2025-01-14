import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
    (data: string | string[], context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        return request.rawHeaders;
    }
)