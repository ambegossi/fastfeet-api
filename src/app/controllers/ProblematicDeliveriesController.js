import DeliveryProblem from '../models/DeliveryProblem';

class ProblematicDeliveriesController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveriesWithProblems = await DeliveryProblem.findAll({
      order: ['created_at'],
      limit: 6,
      offset: (page - 1) * 6,
    });
    return res.json(deliveriesWithProblems);
  }
}

export default new ProblematicDeliveriesController();
