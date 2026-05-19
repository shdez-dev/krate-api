import { CartItem } from './cart-item.entity';

export class Cart {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public items: CartItem[],
    public readonly createdAt: Date,
  ) {}

  get total(): number {
    return 0; // El total se calcula con precios reales en el service
  }
}
