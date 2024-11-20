import { Test, TestingModule } from '@nestjs/testing';

import { CreateAuthDto, LoginAuthDto, UpdateAuthDto } from '../auth/dto';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            create: jest.fn(),
            login: jest.fn(),
            checkAuthStatus: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            removeAll: jest.fn(),
          },
        },
      ],
    }).overrideGuard(AuthGuard('default'))
      .useValue({
        canActivate: jest.fn(() => true), // Simula que siempre pasa la autenticación
      })
      .compile();;

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should create a user', async () => {
    const dto: CreateAuthDto = { email: 'test@example.com', password: 'password', passwordConfirm: 'password' };
    const result = { id: '1', email: dto.email, isActive: true, token: 'mockToken' };

    jest.spyOn(authService, 'create').mockResolvedValue(result);

    expect(await authController.create(dto)).toBe(result);
    expect(authService.create).toHaveBeenCalledWith(dto);
  });

  it('should login a user', async () => {
    const dto: LoginAuthDto = { email: 'test@example.com', password: 'password', passwordConfirm: 'password' };
    const result = { id: '1', email: dto.email, isActive: true, token: 'mockToken' };

    jest.spyOn(authService, 'login').mockResolvedValue(result);

    expect(await authController.login(dto)).toBe(result);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should find a user by term', async () => {
    const term = '1';
    const result = {
      id: term,
      email: 'test@example.com',
      password: 'hashed_password',
      isActive: true,
      roles: ['user'],
    };

    jest.spyOn(authService, 'findOne').mockResolvedValue(result as User);

    expect(await authController.findOne(term)).toBe(result);
    expect(authService.findOne).toHaveBeenCalledWith(term);
  });

  it('should remove a user by id', async () => {
    const id = '1'; // ID del usuario que será eliminado
    const resultMessage = `User with ID "${id}" has been deleted successfully`;

    // Simulamos la implementación del método remove
    jest.spyOn(authService, 'remove').mockResolvedValue(resultMessage);

    // Realizamos la prueba
    expect(await authController.remove(id)).toBe(resultMessage);

    // Verificamos que el método remove haya sido llamado con el ID correcto
    expect(authService.remove).toHaveBeenCalledWith(id);
  });

  it('should update a user by id', async () => {
    const id = '1'; // ID del usuario que será actualizado
    const updateAuthDto = {
      email: 'updated@example.com',
      password: 'newpassword',
    }; // DTO con los datos actualizados
    const updatedUser = {
      id,
      email: updateAuthDto.email,
      isActive: true,
      roles: ['user'],
    }; // Usuario actualizado simulado

    // Simulamos la implementación del método update
    jest.spyOn(authService, 'update').mockResolvedValue(updatedUser as User);

    // Realizamos la prueba
    expect(await authController.update(id, updateAuthDto)).toBe(updatedUser);

    // Verificamos que el método update haya sido llamado con los argumentos correctos
    expect(authService.update).toHaveBeenCalledWith(id, updateAuthDto);
  });

});
