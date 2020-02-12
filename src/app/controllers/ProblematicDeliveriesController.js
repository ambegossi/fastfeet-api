import DeliveryProblem from '../models/DeliveryProblem';

class ProblematicDeliveriesController {
  async index(req, res) {
    const deliveriesWithProblems = await DeliveryProblem.findAll();
    return res.json(deliveriesWithProblems);
  }
}

export default new ProblematicDeliveriesController();
