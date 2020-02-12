import Mail from '../../lib/Mail';

class NewDeliveryMail {
  get key() {
    return 'NewDeliveryMail';
  }

  async handle({ data }) {
    const { deliveryman, product, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova encomenda cadastrada - FastFeet',
      template: 'registeredDelivery',
      context: {
        deliveryman: deliveryman.name,
        product,
        recipientName: recipient.name,
        recipientState: recipient.state,
        recipientCity: recipient.city,
        recipientStreet: recipient.street,
        recipientNumber: recipient.street_number,
        recipientZip: recipient.zip_code,
      },
    });
  }
}

export default new NewDeliveryMail();
