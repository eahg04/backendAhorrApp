<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# AhorrApp API

1. Clonar proyecto
2. `npm install`
3. Clonar el archivo `.env.template` y renombrarlo a `.env`
4. Levantar la base de datos

```
docker-compose up -d
```

5.Agregar esta depencia para conectarme de nest a PostgreSQL

```
npm install --save typeorm pg
```

6.Encriptar mis constraseñas

```
npm install bcrypt

npm i --save-dev @types/bcrypt
```

7.Nest Authentication - Passport

```
npm install @nestjs/passport passport

npm install --save-dev @types/passport-local

npm install @nestjs/jwt passport-jwt

npm install --save-dev @types/passport-jwt
```

8.Nest Documentation - Swagger

```
npm install @nestjs/swagger
```

9.Levantar: `npm start:dev`
