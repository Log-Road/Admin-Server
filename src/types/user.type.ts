import { user, ROLE } from './proto.type';

export class User implements user {
  id: string;
  userId: string;
  name: string;
  email: string;
  password: string;
  role: ROLE;
  number: number | null;
  provided: string;
};
