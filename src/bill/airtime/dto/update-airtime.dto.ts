import { PartialType } from '@nestjs/mapped-types';
import { CreateAirtimeDto } from './create-airtime.dto';

export class UpdateAirtimeDto extends PartialType(CreateAirtimeDto) {}
