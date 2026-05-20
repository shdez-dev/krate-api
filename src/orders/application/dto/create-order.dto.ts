export interface ShippingAddressDto {
  street: string;
  city: string;
  country: string;
  zip: string;
}

export interface CreateOrderDto {
  shippingAddress: ShippingAddressDto;
}
