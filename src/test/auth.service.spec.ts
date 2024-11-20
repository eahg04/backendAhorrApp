import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto } from 'src/auth/dto';

describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: Repository<User>;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        remove: jest.fn(),
                        find: jest.fn(),
                        findOneBy: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mockToken'),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        jwtService = module.get<JwtService>(JwtService);

        (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('mockHashedPassword');
        jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
    });

    it('should create a user', async () => {
        const dto: CreateAuthDto = { email: 'test@example.com', password: 'password', passwordConfirm: 'password' };
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = { id: '1', email: dto.email, password: hashedPassword };

        jest.spyOn(userRepository, 'create').mockReturnValue(user as User);
        jest.spyOn(userRepository, 'save').mockResolvedValue(user as User);

        const result = await authService.create(dto);

        expect(result).toEqual({
            id: user.id,
            email: user.email,
            token: 'mockToken',
        });

        expect(userRepository.create).toHaveBeenCalledWith({
            email: dto.email,
            password: hashedPassword,
        });
        expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw an error if passwords do not match during registration', async () => {
        const dto = { email: 'test@example.com', password: 'password', passwordConfirm: 'wrongPassword' };

        await expect(authService.create(dto)).rejects.toThrow('Passwords do not match');
    });

    it('should login a user', async () => {
        const dto: LoginAuthDto = { email: 'test@example.com', password: 'password', passwordConfirm: 'password' };
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = { id: '1', email: dto.email, password: hashedPassword, isActive: true, roles: ['user'] };

        // Mockear bcrypt.compareSync para que devuelva true
        jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

        // Mockear el repositorio para devolver un usuario simulado
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);

        const result = await authService.login(dto);

        expect(result).toEqual({ id: user.id, email: user.email, password: hashedPassword, isActive: true, roles: ['user'], token: 'mockToken' });

        expect(userRepository.findOne).toHaveBeenCalledWith({
            where: { email: dto.email.toLowerCase().trim() },
            select: { email: true, password: true, id: true },
        });
    });

    it('should throw UnauthorizedException if login credentials are invalid', async () => {
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

        await expect(authService.login({ email: 'wrong@example.com', password: 'password', passwordConfirm: 'password' })).rejects.toThrow(
            UnauthorizedException,
        );
    });
});
