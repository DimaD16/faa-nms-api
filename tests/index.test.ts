import { test } from 'node:test';
import assert from 'node:assert';
import { NmsClient } from '../src/index.js';

test('NmsClient - getFilteredNotams with auto-auth', async (t) => {
    const originalFetch = global.fetch;
    const calls: any[] = [];
    
    // Custom mock
    global.fetch = (async (...args: any[]) => {
        calls.push(args);
        if (args[0].includes('/v1/auth/token')) {
            return {
                ok: true,
                json: async () => ({ access_token: 'fake-token', expires_in: 3600 })
            };
        }
        return {
            ok: true,
            status: 200,
            json: async () => ({ status: 'Success', data: { aixm: [] } })
        };
    }) as any;

    try {
        const client = new NmsClient({
            clientId: 'test_client_id',
            clientSecret: 'test_client_secret',
            environment: 'fit'
        });

        const res = await client.getFilteredNotams('AIXM', { nmsId: '1234567812345678' }) as any;
        
        assert.strictEqual(res.status, 'Success');
        assert.strictEqual(calls.length, 2);

        // Check auth request
        const authCall = calls[0];
        assert.strictEqual(authCall[0], 'https://api-fit.cgifederal-aim.com/v1/auth/token');
        assert.strictEqual(authCall[1].method, 'POST');
        
        // Check api request
        const apiCall = calls[1];
        assert.strictEqual(apiCall[0], 'https://api-fit.cgifederal-aim.com/nmsapi/v1/notams?nmsId=1234567812345678');
        assert.strictEqual(apiCall[1].headers.get('Authorization'), 'Bearer fake-token');
        assert.strictEqual(apiCall[1].headers.get('nmsResponseFormat'), 'AIXM');
    } finally {
        global.fetch = originalFetch;
    }
});

test('NmsClient - getNotamsChecklist', async (t) => {
    const originalFetch = global.fetch;
    const calls: any[] = [];
    
    global.fetch = (async (...args: any[]) => {
        calls.push(args);
        if (args[0].includes('/v1/auth/token')) {
            return {
                ok: true,
                json: async () => ({ access_token: 'fake-token-2', expires_in: 3600 })
            };
        }
        return {
            ok: true,
            status: 200,
            json: async () => ({ status: 'Success', data: { checklist: [] } })
        };
    }) as any;

    try {
        const client = new NmsClient({
            clientId: 'test_client_id',
            clientSecret: 'test_client_secret',
            environment: 'fit'
        });

        await client.getNotamsChecklist({ location: '01A' });
        
        const apiCall = calls[1];
        assert.strictEqual(apiCall[0], 'https://api-fit.cgifederal-aim.com/nmsapi/v1/notams/checklist?location=01A');
        assert.strictEqual(apiCall[1].headers.get('Authorization'), 'Bearer fake-token-2');
    } finally {
        global.fetch = originalFetch;
    }
});
