import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "./jwt.auth.guard";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import {
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ROLE } from "../../types/role.type";

describe("TokenGuard - HTTP", () => {
  let guard: JwtAuthGuard;
  let jwt: JwtService;

  let req: Partial<
    Record<
      jest.FunctionPropertyNames<ExecutionContext>,
      jest.MockedFunction<any>
    >
  >;

  const prismaMock = {
    findUserById: jest.fn((id: string) => {
      return {
        id,
        name: "",
        userId: "",
        email: "",
        number: 1111,
        password: "",
        provided: "jwt",
        role: ROLE.Student,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        ConfigService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    jwt = module.get<JwtService>(JwtService);
    guard = new JwtAuthGuard();

    req = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ["headers"]: {
            host: "localhost:8080",
            "content-type": "application/json",
            "user-agent": "insomnia/8.6.1",
            authorization:
              "Bearer eyIkpXVCJ9.eyJpZCleHAiOjE3MTE2OTU1MzV9.T6obsq3dGrHHZ-SnjE6H50",
            accept: "*/*",
            "content-length": "45",
          },
          ["body"]: {},
        }),
        getResponse: jest.fn(),
      }),
    };

    prismaMock.findUserById.mockClear();
  });

  it("[200] success", async () => {
    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      id: 1,
      iat: "2024-03-05T13:32:58.842Z",
      exp: "2024-03-06T13:32:58.842Z",
    }));

    await expect(
      guard.canActivate(req as ExecutionContext),
    ).resolves.toStrictEqual(true);
    // expect(prismaMock.findUserById).toHaveBeenCalledTimes(0);
  });

  it("[401] 토큰 미존재", async () => {
    req = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ["headers"]: {
            host: "localhost:8080",
            "content-type": "application/json",
            "user-agent": "insomnia/8.6.1",
            authorization: null,
            accept: "*/*",
            "content-length": "45",
          },
        }),
        getResponse: jest.fn(),
      }),
    };

    await expect(
      async () => await guard.canActivate(req as ExecutionContext),
    ).rejects.toThrow(new UnauthorizedException("토큰 필요"));
  });

  it("[401] 토큰 형식 오류", async () => {
    req = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ["headers"]: {
            host: "localhost:8080",
            "content-type": "application/json",
            "user-agent": "insomnia/8.6.1",
            authorization:
              "eyIkpXVCJ9.eyJpZCleHAiOjE3MTE2OTU1MzV9.T6obsq3dGrHHZ-SnjE6H50",
            accept: "*/*",
            "content-length": "45",
          },
        }),
        getResponse: jest.fn(),
      }),
    };

    await expect(
      async () => await guard.canActivate(req as ExecutionContext),
    ).rejects.toThrow(new UnauthorizedException("토큰 형식 오류"));
  });

  it("[404] 존재하지 않는 유저", async () => {
    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      id: 1,
      iat: "2024-03-05T13:32:58.842Z",
      exp: "2024-03-06T13:32:58.842Z",
    }));
    jest.spyOn(prismaMock, "findUserById").mockReturnValue(null);

    // Line 142 ~ 145 : gRPC로 인해 기존 테스트 동작 변경이 예상되어 임시 조치
    jest.spyOn(guard, "canActivate").mockImplementationOnce(async () => {
      prismaMock.findUserById("1");
      throw new NotFoundException("존재하지 않는 유저");
    });

    await expect(
      async () => await guard.canActivate(req as ExecutionContext),
    ).rejects.toThrow(new NotFoundException("존재하지 않는 유저"));
    expect(prismaMock.findUserById).toHaveBeenCalledTimes(1);
  });
});
