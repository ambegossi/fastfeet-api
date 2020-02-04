import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' '); // Discard "Bearer "

  // Define try and catch, as this can return an error
  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;

    return next(); // For UserController update to be called, because the user is authenticated
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
