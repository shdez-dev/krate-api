export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public parentId: string | null,
    public readonly createdAt: Date,
  ) {}
}
