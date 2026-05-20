import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import * as dotenv from 'dotenv';
import { UserOrmEntity } from '../../users/infrastructure/persistence/user.orm-entity';
import { CategoryOrmEntity } from '../../categories/infrastructure/persistence/category.orm-entity';
import { ProductOrmEntity } from '../../products/infrastructure/persistence/product.orm-entity';
import { UserRole } from '../../shared/domain/value-objects/user-role.enum';

dotenv.config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'krate_db',
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? 'secret',
  entities: [UserOrmEntity, CategoryOrmEntity, ProductOrmEntity],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('Conectado a la base de datos');

  const userRepo = dataSource.getRepository(UserOrmEntity);
  const categoryRepo = dataSource.getRepository(CategoryOrmEntity);
  const productRepo = dataSource.getRepository(ProductOrmEntity);

  // ── Usuarios ──────────────────────────────────────────────────────────────
  const existingAdmin = await userRepo.findOne({
    where: { email: 'admin@krate.dev' },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin1234!', 12);
    await userRepo.save(
      userRepo.create({
        id: uuid(),
        email: 'admin@krate.dev',
        passwordHash,
        firstName: 'Admin',
        lastName: 'Krate',
        role: UserRole.ADMIN,
        refreshToken: null,
      }),
    );
    console.log('✓ Admin creado — admin@krate.dev / Admin1234!');
  } else {
    console.log('· Admin ya existe, omitiendo');
  }

  // ── Categorías ────────────────────────────────────────────────────────────
  const categoryIds = {
    electronics: uuid(),
    clothing: uuid(),
    home: uuid(),
  };

  const existingCategories = await categoryRepo.count();

  if (existingCategories === 0) {
    await categoryRepo.save([
      categoryRepo.create({
        id: categoryIds.electronics,
        name: 'Electrónica',
        description: 'Dispositivos electrónicos y accesorios',
        parentId: null,
      }),
      categoryRepo.create({
        id: categoryIds.clothing,
        name: 'Ropa',
        description: 'Prendas de vestir para todas las ocasiones',
        parentId: null,
      }),
      categoryRepo.create({
        id: categoryIds.home,
        name: 'Hogar',
        description: 'Artículos para el hogar y decoración',
        parentId: null,
      }),
    ]);
    console.log('✓ 3 categorías creadas');
  } else {
    console.log('· Categorías ya existen, omitiendo');
    const cats = await categoryRepo.find();
    categoryIds.electronics = cats[0]?.id ?? categoryIds.electronics;
    categoryIds.clothing = cats[1]?.id ?? categoryIds.clothing;
    categoryIds.home = cats[2]?.id ?? categoryIds.home;
  }

  // ── Productos ─────────────────────────────────────────────────────────────
  const existingProducts = await productRepo.count();

  if (existingProducts === 0) {
    await productRepo.save([
      // Electrónica
      productRepo.create({
        id: uuid(),
        name: 'Laptop Pro 15',
        description:
          'Laptop de alto rendimiento con procesador Intel i7 y 16GB RAM',
        price: 1299.99,
        stock: 15,
        imageUrl: null,
        categoryId: categoryIds.electronics,
        deletedAt: null,
      }),
      productRepo.create({
        id: uuid(),
        name: 'Auriculares Bluetooth',
        description: 'Auriculares inalámbricos con cancelación de ruido activa',
        price: 89.99,
        stock: 40,
        imageUrl: null,
        categoryId: categoryIds.electronics,
        deletedAt: null,
      }),
      productRepo.create({
        id: uuid(),
        name: 'Monitor 27" 4K',
        description: 'Monitor Ultra HD con panel IPS y 144Hz',
        price: 449.99,
        stock: 10,
        imageUrl: null,
        categoryId: categoryIds.electronics,
        deletedAt: null,
      }),
      productRepo.create({
        id: uuid(),
        name: 'Teclado Mecánico',
        description: 'Teclado mecánico RGB con switches Cherry MX Red',
        price: 79.99,
        stock: 25,
        imageUrl: null,
        categoryId: categoryIds.electronics,
        deletedAt: null,
      }),
      // Ropa
      productRepo.create({
        id: uuid(),
        name: 'Camiseta Premium',
        description: 'Camiseta 100% algodón orgánico de corte slim fit',
        price: 24.99,
        stock: 100,
        imageUrl: null,
        categoryId: categoryIds.clothing,
        deletedAt: null,
      }),
      productRepo.create({
        id: uuid(),
        name: 'Chaqueta Impermeable',
        description: 'Chaqueta resistente al agua para actividades outdoor',
        price: 129.99,
        stock: 30,
        imageUrl: null,
        categoryId: categoryIds.clothing,
        deletedAt: null,
      }),
      productRepo.create({
        id: uuid(),
        name: 'Zapatillas Running',
        description: 'Zapatillas ligeras con amortiguación para correr',
        price: 94.99,
        stock: 50,
        imageUrl: null,
        categoryId: categoryIds.clothing,
        deletedAt: null,
      }),
      // Hogar
      productRepo.create({
        id: uuid(),
        name: 'Lámpara LED Escritorio',
        description:
          'Lámpara de escritorio con luz regulable y temperatura de color',
        price: 39.99,
        stock: 60,
        imageUrl: null,
        categoryId: categoryIds.home,
        deletedAt: null,
      }),
      productRepo.create({
        id: uuid(),
        name: 'Silla Ergonómica',
        description: 'Silla de oficina con soporte lumbar ajustable',
        price: 299.99,
        stock: 8,
        imageUrl: null,
        categoryId: categoryIds.home,
        deletedAt: null,
      }),
      productRepo.create({
        id: uuid(),
        name: 'Cafetera Automática',
        description: 'Cafetera con molinillo integrado y 15 bares de presión',
        price: 199.99,
        stock: 20,
        imageUrl: null,
        categoryId: categoryIds.home,
        deletedAt: null,
      }),
    ]);
    console.log('✓ 10 productos creados');
  } else {
    console.log('· Productos ya existen, omitiendo');
  }

  await dataSource.destroy();
  console.log('Seed completado');
}

seed().catch((err) => {
  console.error('Error en el seed:', err);
  process.exit(1);
});
