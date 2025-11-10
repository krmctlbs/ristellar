#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, Map, Symbol, Vec,
};

#[derive(Clone)]
#[contracttype]
pub struct Event {
    pub id: u32,
    pub name: Symbol,
    pub description: Symbol,
    pub date: u64, // Unix timestamp
    pub total_tickets: u32,
    pub price: i128, // Price in stroops (1 XLM = 10,000,000 stroops)
    pub organizer: Address,
    pub sold: u32,
}

#[derive(Clone)]
#[contracttype]
pub struct Ticket {
    pub id: u32,
    pub event_id: u32,
    pub owner: Address,
    pub purchased_at: u64,
}

const EVENTS: Symbol = symbol_short!("EVENTS");
const TICKETS: Symbol = symbol_short!("TICKETS");
const NEXT_EVENT_ID: Symbol = symbol_short!("NEXT_EID");
const NEXT_TICKET_ID: Symbol = symbol_short!("NEXT_TID");
const USER_TICKETS: Symbol = symbol_short!("U_TICKETS");

#[contract]
pub struct EventTicketingContract;

#[contractimpl]
impl EventTicketingContract {
    /// Initialize the contract
    pub fn initialize(env: Env) {
        env.storage().instance().set(&NEXT_EVENT_ID, &0u32);
        env.storage().instance().set(&NEXT_TICKET_ID, &0u32);
    }

    /// Create a new event
    pub fn create_event(
        env: Env,
        organizer: Address,
        name: Symbol,
        description: Symbol,
        date: u64,
        total_tickets: u32,
        price: i128,
    ) -> u32 {
        organizer.require_auth();

        let next_id: u32 = env
            .storage()
            .instance()
            .get(&NEXT_EVENT_ID)
            .unwrap_or(0u32);

        let event = Event {
            id: next_id,
            name: name.clone(),
            description: description.clone(),
            date,
            total_tickets,
            price,
            organizer: organizer.clone(),
            sold: 0,
        };

        // Store event
        let mut events: Map<u32, Event> = env
            .storage()
            .instance()
            .get(&EVENTS)
            .unwrap_or(Map::new(&env));

        events.set(next_id, event);
        env.storage().instance().set(&EVENTS, &events);

        // Update next event ID
        env.storage()
            .instance()
            .set(&NEXT_EVENT_ID, &(next_id + 1u32));

        next_id
    }

    /// Get event details
    pub fn get_event(env: Env, event_id: u32) -> Event {
        let events: Map<u32, Event> = env
            .storage()
            .instance()
            .get(&EVENTS)
            .unwrap_or(Map::new(&env));

        events
            .get(event_id)
            .unwrap_or_else(|| panic!("Event not found"))
    }

    /// Get all events
    pub fn get_all_events(env: Env) -> Vec<Event> {
        let events: Map<u32, Event> = env
            .storage()
            .instance()
            .get(&EVENTS)
            .unwrap_or(Map::new(&env));

        let mut event_vec = vec![&env];
        let mut i = 0u32;
        let next_id: u32 = env
            .storage()
            .instance()
            .get(&NEXT_EVENT_ID)
            .unwrap_or(0u32);

        while i < next_id {
            if let Some(event) = events.get(i) {
                event_vec.push_back(event);
            }
            i += 1;
        }

        event_vec
    }

    /// Purchase a ticket for an event
    pub fn purchase_ticket(env: Env, buyer: Address, event_id: u32) -> u32 {
        buyer.require_auth();

        let mut events: Map<u32, Event> = env
            .storage()
            .instance()
            .get(&EVENTS)
            .unwrap_or(Map::new(&env));

        let mut event: Event = events
            .get(event_id)
            .unwrap_or_else(|| panic!("Event not found"));

        // Check if event has available tickets
        if event.sold >= event.total_tickets {
            panic!("Event sold out");
        }

        // Check if event date hasn't passed
        let current_time = env.ledger().timestamp();
        if current_time > event.date {
            panic!("Event has already passed");
        }

        // In a real implementation, you would transfer XLM here
        // For now, we'll just check authorization

        // Generate ticket ID
        let next_ticket_id: u32 = env
            .storage()
            .instance()
            .get(&NEXT_TICKET_ID)
            .unwrap_or(0u32);

        let ticket = Ticket {
            id: next_ticket_id,
            event_id,
            owner: buyer.clone(),
            purchased_at: current_time,
        };

        // Store ticket
        let mut tickets: Map<u32, Ticket> = env
            .storage()
            .instance()
            .get(&TICKETS)
            .unwrap_or(Map::new(&env));

        tickets.set(next_ticket_id, ticket.clone());
        env.storage().instance().set(&TICKETS, &tickets);

        // Update user's ticket list
        let mut user_tickets: Map<Address, Vec<u32>> = env
            .storage()
            .instance()
            .get(&USER_TICKETS)
            .unwrap_or(Map::new(&env));

        let mut user_ticket_list = user_tickets
            .get(buyer.clone())
            .unwrap_or(vec![&env]);

        user_ticket_list.push_back(next_ticket_id);
        user_tickets.set(buyer, user_ticket_list);
        env.storage().instance().set(&USER_TICKETS, &user_tickets);

        // Update event sold count
        event.sold += 1;
        events.set(event_id, event);
        env.storage().instance().set(&EVENTS, &events);

        // Update next ticket ID
        env.storage()
            .instance()
            .set(&NEXT_TICKET_ID, &(next_ticket_id + 1u32));

        next_ticket_id
    }

    /// Get ticket details
    pub fn get_ticket(env: Env, ticket_id: u32) -> Ticket {
        let tickets: Map<u32, Ticket> = env
            .storage()
            .instance()
            .get(&TICKETS)
            .unwrap_or(Map::new(&env));

        tickets
            .get(ticket_id)
            .unwrap_or_else(|| panic!("Ticket not found"))
    }

    /// Get all tickets owned by a user
    pub fn get_user_tickets(env: Env, user: Address) -> Vec<u32> {
        let user_tickets: Map<Address, Vec<u32>> = env
            .storage()
            .instance()
            .get(&USER_TICKETS)
            .unwrap_or(Map::new(&env));

        user_tickets.get(user).unwrap_or(vec![&env])
    }

    /// Transfer a ticket to another user
    pub fn transfer_ticket(env: Env, from: Address, to: Address, ticket_id: u32) {
        from.require_auth();

        let mut tickets: Map<u32, Ticket> = env
            .storage()
            .instance()
            .get(&TICKETS)
            .unwrap_or(Map::new(&env));

        let mut ticket: Ticket = tickets
            .get(ticket_id)
            .unwrap_or_else(|| panic!("Ticket not found"));

        // Verify ownership
        if ticket.owner != from {
            panic!("Not authorized to transfer this ticket");
        }

        // Update ticket owner
        ticket.owner = to.clone();
        tickets.set(ticket_id, ticket);
        env.storage().instance().set(&TICKETS, &tickets);

        // Update user ticket lists
        let mut user_tickets: Map<Address, Vec<u32>> = env
            .storage()
            .instance()
            .get(&USER_TICKETS)
            .unwrap_or(Map::new(&env));

        // Remove from sender's list
        let from_list = user_tickets
            .get(from.clone())
            .unwrap_or(vec![&env]);

        let mut new_from_list = vec![&env];
        for i in 0..from_list.len() {
            if from_list.get(i).unwrap() != ticket_id {
                new_from_list.push_back(from_list.get(i).unwrap());
            }
        }
        user_tickets.set(from, new_from_list);

        // Add to receiver's list
        let mut to_list = user_tickets
            .get(to.clone())
            .unwrap_or(vec![&env]);

        to_list.push_back(ticket_id);
        user_tickets.set(to, to_list);
        env.storage().instance().set(&USER_TICKETS, &user_tickets);
    }

    /// Verify ticket ownership
    pub fn verify_ticket(env: Env, ticket_id: u32, owner: Address) -> bool {
        let tickets: Map<u32, Ticket> = env
            .storage()
            .instance()
            .get(&TICKETS)
            .unwrap_or(Map::new(&env));

        if let Some(ticket) = tickets.get(ticket_id) {
            ticket.owner == owner
        } else {
            false
        }
    }

    /// Get event statistics
    pub fn get_event_stats(env: Env, event_id: u32) -> (u32, u32) {
        let event = Self::get_event(env, event_id);
        (event.sold, event.total_tickets)
    }
}

#[cfg(test)]
mod test;
