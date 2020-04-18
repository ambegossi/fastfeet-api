import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO, isBefore } from 'date-fns';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import File from '../models/File';

import validateTime from '../../utils/validateTime';

class DeliverymanDeliveryController {
  async index(req, res) {
    const { delivered } = req.query;
    const { id } = req.params;

    // List not delivered
    if (delivered === 'not') {
      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: id,
          canceled_at: null,
          end_date: null,
        },
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: [
              'id',
              'name',
              'state',
              'city',
              'street',
              'zip_code',
              'street_number',
            ],
          },
          {
            model: File,
            as: 'signature',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      return res.json(deliveries);
    }

    // List delivered
    if (delivered === 'yes') {
      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: id,
          end_date: {
            [Op.ne]: null,
          },
        },
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: [
              'id',
              'name',
              'state',
              'city',
              'street',
              'zip_code',
              'street_number',
            ],
          },
          {
            model: File,
            as: 'signature',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      return res.json(deliveries);
    }

    // if no option is provided, then list all deliveries
    const deliveries = await Delivery.findAll({
      where: { deliveryman_id: id },
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number().when('end_date', (end_date, field) =>
        end_date ? field.required() : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const { start_date, end_date, signature_id } = req.body;

    if (start_date) {
      // req.body format: "2020-02-11T16:00:00-03:00"
      // Validate time between 8-18 hours
      if (!validateTime(start_date)) {
        return res.status(400).json({
          error: 'Withdrawals can only be made between 08:00 and 18:00',
        });
      }

      const startTimeOfDay = startOfDay(parseISO(start_date));
      const endTimeOfDay = endOfDay(parseISO(start_date));

      // Searches for all deliveries that have already been withdrawn on the day informed (start_date)
      // The deliveryman can only make 5 withdrawals per day
      const dateDeliveries = await Delivery.findAll({
        where: {
          deliveryman_id: delivery.deliveryman_id,
          start_date: {
            [Op.gt]: startTimeOfDay,
            [Op.lt]: endTimeOfDay,
          },
        },
      });

      if (dateDeliveries.length >= 5) {
        return res.status(400).json({ error: 'You reached the day limit' });
      }
    }

    if (end_date && signature_id) {
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
}

export default new DeliverymanDeliveryController();
