use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(EventTicketingContract, ());
    let client = EventTicketingContractClient::new(&env, &contract_id);

    client.initialize();
}

#[test]
fn test_create_event() {
    let env = Env::default();
    let contract_id = env.register(EventTicketingContract, ());
    let client = EventTicketingContractClient::new(&env, &contract_id);

    client.initialize();

    let organizer = Address::generate(&env);
    let name = symbol_short!("Concert");
    let description = symbol_short!("MusicEvt");
    let date = 1735689600u64; // Future date
    let total_tickets = 100u32;
    let price = 10_000_000i128; // 1 XLM in stroops

    let event_id = client.create_event(
        &organizer,
        &name,
        &description,
        &date,
        &total_tickets,
        &price,
    );

    assert_eq!(event_id, 0u32);

    let event = client.get_event(&event_id);
    assert_eq!(event.name, name);
    assert_eq!(event.total_tickets, total_tickets);
    assert_eq!(event.price, price);
    assert_eq!(event.sold, 0u32);
}

#[test]
fn test_purchase_ticket() {
    let env = Env::default();
    let contract_id = env.register(EventTicketingContract, ());
    let client = EventTicketingContractClient::new(&env, &contract_id);

    client.initialize();

    let organizer = Address::generate(&env);
    let buyer = Address::generate(&env);
    let name = symbol_short!("Concert");
    let description = symbol_short!("MusicEvt");
    let date = 1735689600u64;
    let total_tickets = 100u32;
    let price = 10_000_000i128;

    let event_id = client.create_event(
        &organizer,
        &name,
        &description,
        &date,
        &total_tickets,
        &price,
    );

    let ticket_id = client.purchase_ticket(&buyer, &event_id);

    assert_eq!(ticket_id, 0u32);

    let ticket = client.get_ticket(&ticket_id);
    assert_eq!(ticket.event_id, event_id);
    assert_eq!(ticket.owner, buyer);

    let stats = client.get_event_stats(&event_id);
    assert_eq!(stats.0, 1u32); // sold
    assert_eq!(stats.1, 100u32); // total

    let user_tickets = client.get_user_tickets(&buyer);
    assert_eq!(user_tickets.len(), 1u32);
    assert_eq!(user_tickets.get(0).unwrap(), ticket_id);
}

#[test]
fn test_transfer_ticket() {
    let env = Env::default();
    let contract_id = env.register(EventTicketingContract, ());
    let client = EventTicketingContractClient::new(&env, &contract_id);

    client.initialize();

    let organizer = Address::generate(&env);
    let buyer = Address::generate(&env);
    let recipient = Address::generate(&env);
    let name = symbol_short!("Concert");
    let description = symbol_short!("MusicEvt");
    let date = 1735689600u64;
    let total_tickets = 100u32;
    let price = 10_000_000i128;

    let event_id = client.create_event(
        &organizer,
        &name,
        &description,
        &date,
        &total_tickets,
        &price,
    );

    let ticket_id = client.purchase_ticket(&buyer, &event_id);

    client.transfer_ticket(&buyer, &recipient, &ticket_id);

    let ticket = client.get_ticket(&ticket_id);
    assert_eq!(ticket.owner, recipient);

    let is_verified = client.verify_ticket(&ticket_id, &recipient);
    assert_eq!(is_verified, true);

    let recipient_tickets = client.get_user_tickets(&recipient);
    assert_eq!(recipient_tickets.len(), 1u32);
}

#[test]
#[should_panic(expected = "Event sold out")]
fn test_purchase_ticket_sold_out() {
    let env = Env::default();
    let contract_id = env.register(EventTicketingContract, ());
    let client = EventTicketingContractClient::new(&env, &contract_id);

    client.initialize();

    let organizer = Address::generate(&env);
    let buyer = Address::generate(&env);
    let name = symbol_short!("Concert");
    let description = symbol_short!("MusicEvt");
    let date = 1735689600u64;
    let total_tickets = 1u32;
    let price = 10_000_000i128;

    let event_id = client.create_event(
        &organizer,
        &name,
        &description,
        &date,
        &total_tickets,
        &price,
    );

    client.purchase_ticket(&buyer, &event_id);
    // This should panic
    client.purchase_ticket(&buyer, &event_id);
}
