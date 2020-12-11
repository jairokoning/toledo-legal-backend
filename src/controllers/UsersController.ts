import {request, Request, Response} from 'express';
import { getRepository } from  'typeorm';
import { hash } from 'bcryptjs';
import * as Yup from 'yup';

import User from '../models/User';
import usersView from '../views/users_view';

export default {
  async index(request: Request, response: Response) {
    const usersRepository = getRepository(User);

    const users = await usersRepository.find();

    return response.status(200).json(usersView.renderMany(users));
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const usersRepository = getRepository(User);

    const user = await usersRepository.findOneOrFail(id);

    return response.status(200).json(usersView.render(user));
  },

  async create(request: Request, response: Response) {    
    const { name, email, password, password_confirmation } = request.body;

    const usersRepository = getRepository(User);    

    const data = { name, email, password, password_confirmation };

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome é obrigatório'),
      email: Yup.string().email('Informe um e-mail válido').required('E-mail é obrigatório'),
      password: Yup.string().min(6, 'No mínimo 6 dígitos').required('Senha é obrigatório'),
      password_confirmation: Yup
        .string()
        .oneOf(
          [Yup.ref('password'), undefined],
          'Confirmação incorreta')
        .required('Confirmação da senha é obrigatório'),
    })

    await schema.validate(data, {
      abortEarly: false,
    });

    const hashedPassword = await hash(password, 8);

    const user = usersRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await usersRepository.save(user);

    return response.status(201).json(usersView.render(user));
  },

  async update(request: Request, response: Response) {
    try {
      const { id } =request.params;
      const { name, email, password, password_confirmation } = request.body;

      const usersRepository = getRepository(User);   

      const data = { name, email, password, password_confirmation };

      const schema = Yup.object().shape({
        name: Yup.string().required('Nome é obrigatório'),
        email: Yup.string().email('Informe um e-mail válido').required('E-mail é obrigatório'),
        password: Yup.string().min(6, 'No mínimo 6 dígitos'),
        password_confirmation: Yup
          .string()
          .oneOf(
            [Yup.ref('password'), undefined],
            'Confirmação incorreta')        
      })

      await schema.validate(data, {
        abortEarly: false,
      });

      if (password && password_confirmation) {
        data.password = await hash(password, 8);
      }

      const user = await usersRepository.findOneOrFail(id);

      user.name = data.name;
      user.email = data.email;
      user.password = data.password;

      usersRepository.create(user);

      await usersRepository.save(user);

      return response.status(201).json(usersView.render(user));
    } catch (error) {
      return response.status(500).json({ message: 'Internal server error' });
    }
  },

  async destroy(request: Request, response: Response) {
    try {
      const { id } = request.params;

      const usersRepository = getRepository(User);

      const user = await usersRepository.findOneOrFail(id);

      await usersRepository.remove(user);

      return response.status(204).json();
    } catch (error) {
      return response.status(500).json({ message: 'Internal server error' });
    }
    
  }
};
