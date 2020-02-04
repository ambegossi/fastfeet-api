import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    // Change email case (Only checks if user entered email)
    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      // If there is already a user with the same email
      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    // Only checks if user entered oldPassword (wants to change password)
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();
