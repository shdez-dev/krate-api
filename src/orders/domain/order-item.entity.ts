export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly unitPrice: number,
    public readonly quantity: number,
  ) {}

  get subtotal(): number {
    return this.unitPrice * this.quantity;
  }
}
