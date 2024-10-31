export class GetClubResponseDto {
  "clubs": GetClubResponseDtoClubs[];
}

class GetClubResponseDtoClubs {
  "clubId": string;
  "clubName": string;
  "isActive": boolean;
}
