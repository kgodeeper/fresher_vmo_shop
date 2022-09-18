import { IsEnum, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { UUID_REGEX } from '../../utils/regex.util';
import { ShipmentStatus } from '../../commons/enum.common';
import * as Message from '../../commons/string.common';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;
}

export class OrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(UUID_REGEX, { message: Message.ValidatorMessage.UUID_NOT_VALID })
  deliveryId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(UUID_REGEX, { message: Message.ValidatorMessage.UUID_NOT_VALID })
  couponId: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        modelId: { type: 'string' },
        quantity: { type: 'number' },
      },
    },
  })
  @IsNotEmpty()
  carts: { modelId: string; quantity: number }[];
}
