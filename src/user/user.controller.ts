import { Body, Controller, Get, HttpException, HttpStatus, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get()
  async findMe(@User('id') id: string) {
    return await this.userService.findById(id);
  }

  @ApiBearerAuth()
  @Put()
  async updateUser(@User('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const _user = await this.userService.findOne(loginUserDto);
    if (!_user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!this.userService.comparePassword(loginUserDto.password, _user.password)) {
      throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
    }

    const token = this.userService.generateJwt(_user);
    return {
      id: _user._id,
      email: _user.email,
      name: _user.name,
      token,
    };
  }
}
