import { Op } from 'sequelize';
import Delivery from '../models/Delivery';

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
      });

      return res.json(deliveries);
    }

    // if no option is provided, then list all deliveries
    const deliveries = await Delivery.findAll({
      where: { deliveryman_id: id },
    });

    return res.json(deliveries);
  }
}

export default new DeliverymanDeliveryController();
