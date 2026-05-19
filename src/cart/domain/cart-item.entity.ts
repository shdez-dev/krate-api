export class CartItem {
  constructor(
    public readonly id: string,
    public cartId: string,
    public productId: string,
    public quantity: number,
  ) {}
}
