import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PackageModule } from './package/package.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST_DEV,
      port: +process.env.DB_PORT_DEV,
      username: process.env.DB_USERNAME_DEV,
      password: process.env.DB_PASSWORD_DEV,
      database: process.env.DB_NAME_DEV,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    PackageModule,
  ],
})
export class AppModule { }
