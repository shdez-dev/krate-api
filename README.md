<p align="center">
  <img src="./banner.svg" alt="Krate API" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/TypeORM-0.3-FE0803?style=flat-square" alt="TypeORM"/>
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Swagger-OpenAPI_3-85EA2D?style=flat-square&logo=swagger&logoColor=black" alt="Swagger"/>
</p>

---

**Krate** es una API REST de e-commerce construida con arquitectura hexagonal sobre NestJS. Gestiona usuarios, productos, órdenes y pagos, exponiendo endpoints RESTful consumibles por cualquier cliente. Proyecto de portafolio orientado a producción.

## Arquitectura

El proyecto implementa **arquitectura hexagonal** (ports & adapters) organizada por módulo. Cada módulo está dividido en cuatro capas estrictas:

```
src/
├── shared/                        # Transversal: guards, decorators, ports comunes
│   ├── domain/value-objects/
│   ├── application/ports/
│   ├── infrastructure/services/
│   └── presentation/
│
├── {módulo}/
│   ├── domain/                    # Entidades puras TypeScript + repository ports
│   ├── application/               # Casos de uso, servicios, DTOs internos
│   ├── infrastructure/            # TypeORM: OrmEntity, Mapper, Repository impl.
│   └── presentation/              # Controller + DTOs HTTP (request/response)
```

Las capas de `domain` y `application` no tienen dependencias de NestJS, TypeORM ni Express. Los repositorios se inyectan mediante `abstract class` como token de port, lo que permite intercambiar implementaciones sin tocar la lógica de negocio.

## Stack

| Categoría | Tecnología |
|---|---|
| Runtime | Node.js 20 LTS · NestJS 10 · TypeScript 5 |
| Base de datos | MySQL 8.0 · TypeORM 0.3 |
| Autenticación | JWT (access 15min + refresh 7d) · Passport.js · bcrypt |
| Validación | class-validator · class-transformer · ValidationPipe global |
| Documentación | Swagger / OpenAPI 3 — disponible en `/api/docs` |
| Seguridad | Helmet · CORS · refresh tokens almacenados hasheados |
| DevOps | Docker · docker-compose · GitHub Actions CI · Railway |

## Módulos

| Módulo | Descripción |
|---|---|
| **Auth** | Registro, login, logout, refresh de token con roles |
| **Users** | Gestión de perfil y roles (admin / customer) |
| **Categories** | CRUD de categorías con relación padre-hijo |
| **Products** | CRUD con stock, imágenes, filtros, paginación y soft delete |
| **Cart** | Carrito por sesión de usuario |
| **Orders** | Creación de órdenes desde carrito con transacciones atómicas |
| **Payments** | Registro de pagos y actualización automática de estado de orden |
| **Admin** | Reportes de ventas y gestión restringida a rol admin |

## Endpoints

| Método | Ruta | Auth |
|---|---|---|
| `POST` | `/auth/register` | — |
| `POST` | `/auth/login` | — |
| `POST` | `/auth/refresh` | — |
| `POST` | `/auth/logout` | JWT |
| `GET / PUT` | `/users/me` | JWT |
| `GET` | `/categories` | — |
| `POST / PUT / DELETE` | `/categories/:id` | ADMIN |
| `GET` | `/products` | — |
| `POST / PUT / DELETE` | `/products/:id` | ADMIN |
| `GET / POST / PATCH / DELETE` | `/cart` | JWT |
| `GET / POST` | `/orders` | JWT |
| `PATCH` | `/orders/:id/status` | ADMIN |
| `POST` | `/payments` | JWT |
| `GET` | `/admin/stats` | ADMIN |

La documentación completa con schemas y ejemplos está disponible en `/api/docs` (Swagger UI).

## Instalación y uso

### Prerrequisitos

- Node.js 20+
- Docker y docker-compose

### Con Docker

```bash
cp .env.example .env
docker-compose up -d
```

La API levanta en `http://localhost:3000` y Swagger en `http://localhost:3000/api/docs`.

### Local

```bash
cp .env.example .env
npm install
npm run start:dev
```

### Variables de entorno

| Variable | Descripción |
|---|---|
| `DB_HOST` | Host de MySQL |
| `DB_PORT` | Puerto de MySQL |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de MySQL |
| `DB_PASS` | Contraseña de MySQL |
| `JWT_SECRET` | Clave de firma del access token |
| `JWT_REFRESH_SECRET` | Clave de firma del refresh token |
| `JWT_EXPIRES_IN` | Duración del access token (ej. `15m`) |
| `JWT_REFRESH_EXPIRES` | Duración del refresh token (ej. `7d`) |
| `PORT` | Puerto de la aplicación |

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Cobertura
npm run test:cov
```

---

<p align="center">
  Desarrollado por <a href="https://github.com/shdez-dev">Sebastian Hernandez</a>
</p>
