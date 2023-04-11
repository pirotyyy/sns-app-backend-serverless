import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from 'src/share/models/user.model';
import { Jwt } from 'src/share/interfaces/jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(dto: LoginUserDto): Promise<Omit<User, 'hashedPassword'>> {
    try {
      const user = await this.userService.getById(dto.userId);

      return user;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw new UnauthorizedException('Username or password is incorrect');
      } else {
        throw error;
      }
    }
  }

  async login(dto: LoginUserDto): Promise<Jwt> {
    const user = await this.validateUser(dto);

    if (user) {
      const payload = { sub: user.userId, username: user.username };
      const token = await this.jwtService.signAsync(payload);
      return {
        access_token: token,
      };
    }
  }
}
