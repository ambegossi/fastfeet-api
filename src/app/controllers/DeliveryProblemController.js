import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
import Deliveryman from '../models/Deliveryman';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class DeliveryProblemController {
  async index(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const problems = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
    });

    return res.json(problems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { description } = req.body;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const problem = await DeliveryProblem.create({
      description,
      delivery_id: id,
    });
    return res.json(problem);
  }

  async delete(req, res) {
    const { id } = req.params;
    const problem = await DeliveryProblem.findByPk(id, {
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'deliveryman_id', 'product'],
          include: {
            model: Deliveryman,
            as: 'deliveryman',
            attributes: ['name', 'email'],
          },
        },
      ],
    });

    if (!problem) {
      return res.status(400).json({ error: 'Problem not found' });
    }

    const delivery = await Delivery.findByPk(problem.delivery.id);

    if (delivery.canceled_at !== null) {
      return res
        .status(400)
        .json({ error: 'This delivery has already been canceled' });
    }

    delivery.canceled_at = new Date();

    await delivery.save();

    // Send email to deliveryman
    await Queue.add(CancellationMail.key, {
      deliveryman: problem.delivery.deliveryman,
      delivery_id: problem.delivery.id,
      product: problem.delivery.product,
      description: problem.description,
    });

    return res.json(delivery);
  }
}

export default new DeliveryProblemController();
