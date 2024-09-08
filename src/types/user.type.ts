import { ROLE } from "./role.type";

export type User = {
  id: string;
  userId: string;
  name: string;
  email: string;
  password: string;
  role: ROLE;
  number: number | null;
  provided: string;
};
