import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query
} from '@nestjs/common';
import { Auth, GetUser } from './decorators';
import { LoginAuthDto, CreateAuthDto, UpdateAuthDto } from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ValidRoles } from './interfaces';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post("login")
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Get('checkout-status')
  @Auth()
  checkAuthStatus(
    @GetUser("id") userId: string,
  ) {
    return this.authService.checkAuthStatus(userId);
  }

  @Get()
  findAll(
    @Query() PaginationDto: PaginationDto
  ) {
    return this.authService.findAll(PaginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.authService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto);
  }

  @Delete('deleteAll')
  @Auth(ValidRoles.admin)
  removeAll() {
    return this.authService.removeAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.remove(id);
  }
}
