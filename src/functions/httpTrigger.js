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
                    const user = await userService.getUserById(Number(id));
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
            }

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

            if (!body.name) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Field "name" is required' })
                };
            }

            const user = await userService.createUser(body.name, body.email);
            context.log(`User registered: ${body.name} (ID: ${user.id})`);

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'User registered successfully',
                    user
                })
            };
        } catch (error) {
            context.log(`Error: ${error.message}`);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Internal server error' })
            };
        }
    }
});
