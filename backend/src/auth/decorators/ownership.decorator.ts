import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_PARAM_KEY = 'ownership_param_key';
export const CheckOwnership = (paramName: string = 'id') =>
  SetMetadata(OWNERSHIP_PARAM_KEY, paramName);