import { PartialType } from '@nestjs/mapped-types';
import { CreateTopUpDto } from './create-topup.dto';

export class UpdateTopUpDto extends PartialType(CreateTopUpDto) {}
