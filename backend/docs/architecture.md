# Architecture

Fastify API is a stateless modular monolith. PostgreSQL is source of truth. Redis provides cache, rate limits and queue infrastructure. BullMQ workers handle asynchronous jobs. External tax, payment and search providers are hidden behind adapters.

B2C and B2B share catalog, inventory, checkout and order infrastructure but use different customer groups, pricing rules, MOQ and UI.
