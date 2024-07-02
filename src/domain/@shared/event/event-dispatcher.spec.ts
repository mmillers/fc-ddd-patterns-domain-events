import Customer from "../../customer/entity/customer";
import CustomerAddressChangedEvent from "../../customer/event/customer-address-changed.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import FirstNotifyWhenCustomerCreatedHandler from "../../customer/event/handler/first-notify-when-customer-created.handler";
import NotifyWhenCustomerAddressChangedHandler from "../../customer/event/handler/notify-when-customer-address-changed.handler";
import SecondNotifyWhenCustomerCreatedHandler from "../../customer/event/handler/second-notify-when-customer-created.handler";
import Address from "../../customer/value-object/address";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain events tests", () => {
  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      0
    );
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      description: "Product 1 description",
      price: 10.0,
    });

    // Quando o notify for executado o SendEmailWhenProductIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(productCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });

  it("should notify when customer changed event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const firstEventHandler = new FirstNotifyWhenCustomerCreatedHandler();
    const secondEventHandler = new SecondNotifyWhenCustomerCreatedHandler();
    const firstSpyEventHandler = jest.spyOn(firstEventHandler, "handle");
    const secondSpyEventHandler = jest.spyOn(secondEventHandler, "handle");

    eventDispatcher.register("CustomerCreatedEvent", firstEventHandler);
    eventDispatcher.register("CustomerCreatedEvent", secondEventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
    ).toBe(2);

    const customerCreatedEvent = new CustomerCreatedEvent({
      name: "Customer Changed",
    });

    eventDispatcher.notify(customerCreatedEvent);

    expect(firstSpyEventHandler).toHaveBeenCalled();
    expect(secondSpyEventHandler).toHaveBeenCalled();
  });

  it("should notify when customer address changed event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new NotifyWhenCustomerAddressChangedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"][0]
    ).toMatchObject(eventHandler);

    const customer = new Customer("uuid-1", "Customer Name");
    const addres = new Address("Rua A", 123, "zip-123", "City A");
    customer.changeAddress(addres);

    const customerAddressChangedEvent = new CustomerAddressChangedEvent({
      id: customer.id,
      nome: customer.name,
      endereco: customer.Address.toString(),
    });

    eventDispatcher.notify(customerAddressChangedEvent);
    expect(spyEventHandler).toHaveBeenCalled();
  });
});
