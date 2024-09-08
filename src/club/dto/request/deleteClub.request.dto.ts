import { User } from "types/user.type";

export class DeleteClubRequestDto {
  "user": User;
}

export class DeleteClubRequestDtoParams {
  "clubId": string;
}
