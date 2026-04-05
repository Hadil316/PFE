import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await this.usersService.validatePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      username: user.username
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    };
  }

  async register(email: string, username: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);
    
    if (existingUser) {
      throw new UnauthorizedException('Cet email est déjà utilisé');
    }

    const newUser = await this.usersService.create({
      email,
      username,
      password,
      role: 'UTILISATEUR'
    });

    const payload = {
      sub: newUser[0].id,
      email: newUser[0].email,
      role: newUser[0].role,
      username: newUser[0].username
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        username: newUser[0].username,
        role: newUser[0].role
      }
    };
  }
}