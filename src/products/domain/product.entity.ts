export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public price: number,
    public stock: number,
    public imageUrl: string | null,
    public categoryId: string,
    public deletedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  get isActive(): boolean {
    return this.deletedAt === null;
  }
}
