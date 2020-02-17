import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { deliveryman, product, delivery_id, description } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `Encomenda ${delivery_id} - ${product} cancelada - FastFeet`,
      template: 'cancellation',
      context: {
        deliveryman: deliveryman.name,
        product,
        delivery_id,
        description,
      },
    });
  }
}

export default new CancellationMail();
