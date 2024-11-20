import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger, NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ArrayContains, Like, Repository } from 'typeorm';

import * as bcrypt from "bcrypt";
import { validate as isUUID } from 'uuid';

import { JwtPayload } from './interfaces';
import { authResponse } from '../common/interfaces';

import { CreateAuthDto, LoginAuthDto, UpdateAuthDto } from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {

  private readonly logger = new Logger("AuthService")

  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService

  ) {

  }

  async create(createAuthDto: CreateAuthDto): Promise<authResponse> {


    const { password, passwordConfirm, ...userData } = createAuthDto;

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    try {

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
      })

      await this.userRepository.save(user);
      delete user.password

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };

    } catch (err) {
      this.handleDBExeptions(err);
    }
  }

  async login(loginUserDto: LoginAuthDto): Promise<authResponse> {
    const { email, password } = loginUserDto;

    const emailTransform = email.toLowerCase().trim()

    const user = await this.userRepository.findOne({
      where: { email: emailTransform },
      select: { email: true, password: true, id: true }
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials (email)');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials (password)');
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };

  }

  async checkAuthStatus(userId: string): Promise<authResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async findAll(PaginationDto: PaginationDto): Promise<User | User[] | authResponse | authResponse[]> {
    let user: User | User[] | null = null;

    const { limit = 10, offset = 0, search = "" } = PaginationDto;

    const conditions: string[] | any[] = [
      { email: Like(`%${search}%`) },
      { roles: ArrayContains([search]) }
    ];

    if (isUUID(search)) {
      user = await this.userRepository.findOneBy({ id: search });
      return user ? [user] : [];
    }

    user = await this.userRepository.find({
      take: limit,
      skip: offset,
      where: conditions,
    });

    return user.map(({ ...res }) => ({
      ...res,
    }));

  }

  async findOne(term: string): Promise<User> {
    let user: User;

    if (isUUID(term)) {
      user = await this.userRepository.findOneBy({ id: term });
    } else {

      const queryBuilder = this.userRepository.createQueryBuilder('User');
      user = await queryBuilder.where(`UPPER(email) =:email or :roles = ANY(User.roles)`, {
        email: term.toUpperCase(),
        roles: term.toLowerCase()
      }).getOne();
    }

    if (!user) {
      throw new NotFoundException(`user with term ${term} not found`);
    }
    return user;
  }

  async update(id: string, updateAuthDto: UpdateAuthDto): Promise<User> {

    let { password } = updateAuthDto;

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (password) {
      updateAuthDto.password = await bcrypt.hash(password, 10);
    }

    Object.assign(user, updateAuthDto);

    return await this.userRepository.save(user);

  }

  async remove(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    await this.userRepository.remove(user);

    return `User with ID "${userId}" has been deleted successfully`;
  }

  async removeAll(): Promise<string> {
    await this.userRepository.delete({});
    return 'All users have been deleted successfully';
  }

  private getJwtToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload)
    return token;
  }

  private handleDBExeptions(error: any): never {

    if (error.code === '23505') {
      this.logger.error(error.detail);
      throw new ConflictException(error.detail)
    }

    this.logger.error(error);
    throw new InternalServerErrorException("Check logs for errors")
  }
}
