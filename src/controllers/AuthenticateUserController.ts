import { Request, Response} from 'express';
import { getRepository } from  'typeorm';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

import User from '../models/User';
import authConfig from '../config/auth';
import usersView from '../views/users_view';

export default {
  async store(request: Request, response: Response) {
    const { email, password } = request.body;

    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error('Combinação email/senha inválido');
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new Error('Combinação email/senha inválido');
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    })
    
    return response.status(201).json({ user: usersView.render(user), token });
  }
}
