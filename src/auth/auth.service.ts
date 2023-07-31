import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './dto/user.entity';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtPayload } from './dto/jwt.payload.interface';

@Injectable()
export class AuthService {
  //   constructor(@InjectRepository(User)private userRepository: Repository<User>,
  //   );

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });

    //we need to handle the error is being thrown if a similar suername already exist in the db,
    //  this error is thrown because of the   @Column({ unique: true }) username: string;
    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        //duplicated username
        throw new ConflictException('Username already exist');
      } else {
        throw new InternalServerErrorException();
      }
      console.log(error.code);
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accesToken: string }> {
    const { username, password } = authCredentialsDto;
    const user = await this.userRepository.findOne({
      where: {
        username: username,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: jwtPayload = { username };
      const accesToken = await this.jwtService.sign(payload);
      return { accesToken };
    } else {
      throw new UnauthorizedException('Please chek your login credentials');
    }
  }
}
