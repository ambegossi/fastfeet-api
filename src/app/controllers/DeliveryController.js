import * as Yup from 'yup';
import { parseISO, getHours, isBefore } from 'date-fns';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

class DeliveryController {
  async index(req, res) {
    // renders 20 per page
    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation error' });
    }

    const { deliveryman_id, recipient_id } = req.body;

    // Check if Deliveryman exists
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman is not found' });
    }

    // Check if Recipient exists
    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient is not found' });
    }

    const delivery = await Delivery.create(req.body);

    return res.json(delivery);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { start_date, end_date } = req.body;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    if (start_date) {
      // req.body format: "2020-02-11T16:00:00-03:00"
      const parsedStartDate = parseISO(start_date);

      const hourStart = getHours(parsedStartDate);

      // Validate time between 8-18 hours
      if (hourStart < 8 || hourStart > 18) {
        return res.status(400).json({
          error: 'Withdrawals can only be made between 08:00 and 18:00',
        });
      }
    }

    if (end_date) {
      const parsedEndDate = parseISO(end_date);

      // Check if the end date is greater than the start date
      const checkIsBefore = isBefore(parsedEndDate, delivery.start_date);

      if (delivery.start_date && checkIsBefore) {
        return res
          .status(400)
          .json({ error: 'The end date cannot be before the start date' });
      }
    }

    const updatedDelivery = await delivery.update(req.body);
    return res.json(updatedDelivery);
  }

  async delete(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    await delivery.destroy();

    return res.json({ ok: 'Delivery was succesfully deleted' });
  }
}

export default new DeliveryController();
