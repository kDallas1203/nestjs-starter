import { CreateUserDto } from './dto/create-user.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { UserRO } from './user.interface';
import { compareSync, hashSync } from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<UserRO> {
    const findUser = await this.userModel.findOne({ email: createUserDto.email });

    if (findUser) {
      throw new HttpException('User exist', HttpStatus.BAD_REQUEST);
    }

    const password = hashSync(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      password,
    });
    const user = await createdUser.save();

    return this.buildUser(user);
  }

  async findById(id: any) {
    const user = await this.userModel.findById(id);
    if (!user) {
      return null;
    }
    return this.buildUser(user);
  }

  private buildUser(user: User): UserRO {
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      facebookId: user.facebookId,
    };
  }

  async findOne(loginUserDto: LoginUserDto) {
    const user = this.userModel.findOne({ email: loginUserDto.email });
    if (!user) {
      return null;
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  comparePassword(password: string, hashedPassword: string): boolean {
    return compareSync(password, hashedPassword);
  }

  generateJwt(user: User) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() * 60);

    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
    );
  }
}
