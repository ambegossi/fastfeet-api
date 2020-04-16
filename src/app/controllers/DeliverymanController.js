import * as Yup from 'yup';
import Sequelize from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const { page = 1, q, id } = req.query;

    // check if user passed id (mobile)
    if (id) {
      const deliverymens = await Deliveryman.findOne({
        where: {
          id,
        },
        attributes: ['id', 'name', 'email', 'avatar_id', 'created_at'],
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['name', 'path', 'url'],
          },
        ],
      });

      return res.json(deliverymens);
    }

    // check if user passed a Query Parameter
    if (q) {
      const deliverymens = await Deliveryman.findAll({
        where: {
          name: {
            [Sequelize.Op.iLike]: q,
          },
        },
        attributes: ['id', 'name', 'email', 'avatar_id'],
        order: ['created_at'],
        limit: 6,
        offset: (page - 1) * 6,
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['name', 'path', 'url'],
          },
        ],
      });

      return res.json(deliverymens);
    }

    const deliverymens = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      order: ['created_at'],
      limit: 6,
      offset: (page - 1) * 6,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymens);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // check if the email is already registered
    const isRegistered = await Deliveryman.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (isRegistered) {
      return res
        .status(400)
        .json({ error: 'The email provided is already registered' });
    }

    const deliveryman = await Deliveryman.create(req.body);

    return res.json(deliveryman);
  }

  async update(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    // Change email case (Only checks if entered email)
    if (email && email !== deliveryman.email) {
      // check if the admin wants to change to an email that is already registered
      const isRegistered = await Deliveryman.findOne({
        where: {
          email,
        },
      });

      if (isRegistered) {
        return res
          .status(400)
          .json({ error: 'The email provided is already registered' });
      }
    }

    const updatedDeliveryman = await deliveryman.update(req.body);

    return res.json(updatedDeliveryman);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    await deliveryman.destroy();

    return res.json({ ok: 'Deliveryman was succesfully deleted' });
  }
}

export default new DeliverymanController();
