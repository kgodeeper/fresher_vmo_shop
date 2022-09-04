import { IsEnum, IsNotEmpty } from 'class-validator';
import { ShipmentStatus } from '../../commons/enum.common';

export class ChangeStatusDto {
  @IsNotEmpty()
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;
}
