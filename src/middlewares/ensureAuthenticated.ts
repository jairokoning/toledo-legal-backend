import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import authConfig from '../config/auth';

interface ITokenPayload {
  iat: number; // token creation date
  exp: number; // token expires date
  sub: string; // user info (id)
}

export default function ensureAuthenticated(
  request: Request, 
  response: Response, 
  next: NextFunction
): void {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {    
    throw new Error('Token inválido');
  }

  const [, token] = authHeader.split(' ');

  try {
    const  decoded = verify(token, authConfig.jwt.secret);

    const { sub } = decoded as ITokenPayload;

    request.user = {
      id: sub,
    };

    return next();
  } catch (error) {   
    throw new Error('Token inválido');
  }
}