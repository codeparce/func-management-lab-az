const { app } = require('@azure/functions');
const userService = require('../services/userService');

app.http('users', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            if (request.method === 'GET') {
                const id = request.query.get('id');

                if (id) {
                    const user = await userService.getUserById(id);
                    if (!user) {
                        return {
                            status: 404,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ error: 'User not found' })
                        };
                    }
                    return {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(user)
                    };
                }

                const email = request.query.get('email');
                if (email) {
                    const user = await userService.getUserByEmail(email);
                    if (!user) {
                        return {
                            status: 404,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ error: 'User not found' })
                        };
                    }
                    return {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(user)
                    };
                }

                const users = await userService.getAllUsers();
                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(users)
                };
            } else if (request.method === 'POST') {

                let body;
                try {
                    body = await request.json();
                } catch {
                    return {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ error: 'Invalid JSON in request body' })
                    };
                }

                if (!body.name || !body.email || !body.password_hash) {
                    return {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ error: 'Fields "name", "email", and "password_hash" are required' })
                    };
                }

                const existing = await userService.getUserByEmail(body.email);
                if (existing) {
                    return {
                        status: 409,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ error: 'Email already registered' })
                    };
                }

                const user = await userService.createUser({
                    name: body.name,
                    email: body.email,
                    password_hash: body.password_hash
                });
                context.log(`User registered: ${user.name} (ID: ${user.id})`);

                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: 'User registered successfully',
                        user
                    })
                };

            }

        } catch (error) {
            context.log(`Error: `, error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Internal server error' })
            };
        }
    }
});
