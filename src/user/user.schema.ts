import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  password: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  facebookId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
