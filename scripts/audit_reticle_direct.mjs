import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import * as http from 'node:http';

async function main() {
    const home = os.homedir();
    const tokenFile = path.join(home, '.reticle', 'pairing-token');
    if (!fs.existsSync(tokenFile)) {
        console.error('Reticle pairing token not found at ' + tokenFile);
        process.exit(1);
    }
    const token = fs.readFileSync(tokenFile, 'utf8').trim();
    console.log('Read pairing token successfully:', token);

    const port = 4400;
    const ssePath = `/mcp/sse?token=${token}`;
    
    console.log(`Connecting to SSE endpoint http://localhost:${port}${ssePath}...`);

    let postUrl = null;
    let requestId = 1;
    const pendingRequests = new Map();
    let sseRequest = null;

    // Helper to send JSON-RPC POST request
    function postMessage(rpcMessage) {
        return new Promise((resolve, reject) => {
            if (!postUrl) {
                reject(new Error('No POST endpoint received yet'));
                return;
            }
            const body = JSON.stringify(rpcMessage);
            const bodyBuf = Buffer.from(body, 'utf8');
            const parsed = new URL(postUrl);
            
            const options = {
                host: parsed.hostname,
                port: parsed.port,
                path: `${parsed.pathname}${parsed.search}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': bodyBuf.byteLength,
                },
            };

            const req = http.request(options, (res) => {
                res.resume();
                resolve();
            });
            req.on('error', reject);
            req.write(bodyBuf);
            req.end();
        });
    }

    // Helper to call an MCP tool
    function callTool(name, args) {
        const id = requestId++;
        const rpcMessage = {
            jsonrpc: '2.0',
            method: 'tools/call',
            params: {
                name,
                arguments: args
            },
            id
        };

        const promise = new Promise((resolve, reject) => {
            pendingRequests.set(id, { resolve, reject });
        });

        postMessage(rpcMessage).catch(err => {
            const pending = pendingRequests.get(id);
            if (pending) {
                pending.reject(err);
                pendingRequests.delete(id);
            }
        });

        return promise;
    }

    // Connect to SSE stream
    await new Promise((resolve, reject) => {
        sseRequest = http.get({ host: '127.0.0.1', port, path: ssePath }, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to connect: HTTP status ${res.statusCode}`));
                return;
            }

            res.setEncoding('utf8');
            let sseBuffer = '';
            let currentEvent = '';
            let currentData = '';

            res.on('data', (chunk) => {
                sseBuffer += chunk;
                const normalised = sseBuffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const lines = normalised.split('\n');
                sseBuffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (line === '') {
                        if (currentData !== '') {
                            const eventType = currentEvent !== '' ? currentEvent : 'message';
                            
                            if (eventType === 'endpoint') {
                                const rawUrl = currentData;
                                postUrl = rawUrl.startsWith('/') ? `http://127.0.0.1:${port}${rawUrl}` : rawUrl;
                                console.log('MCP SSE connected. POST endpoint resolved:', postUrl);
                                resolve(); // Connected and ready!
                            } else if (eventType === 'message') {
                                try {
                                    const response = JSON.parse(currentData);
                                    if (response.id !== undefined) {
                                        const pending = pendingRequests.get(response.id);
                                        if (pending) {
                                            if (response.error) {
                                                pending.reject(new Error(response.error.message || 'JSON-RPC error'));
                                            } else {
                                                pending.resolve(response.result);
                                            }
                                            pendingRequests.delete(response.id);
                                        }
                                    }
                                } catch (err) {
                                    console.error('Error parsing message data:', err);
                                }
                            }
                        }
                        currentEvent = '';
                        currentData = '';
                    } else if (line.startsWith('event:')) {
                        currentEvent = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        const val = line.slice(5).trim();
                        currentData = currentData !== '' ? `${currentData}\n${val}` : val;
                    }
                }
            });

            res.on('end', () => {
                console.log('SSE connection ended.');
            });
            
            res.on('error', (err) => {
                console.error('SSE response error:', err);
            });
        });

        sseRequest.on('error', (err) => {
            reject(err);
        });
    });

    console.log('Starting audits...');

    // 1. Fetch sessions
    const sessionsResult = await callTool('reticle_sessions', {});
    const sessionsData = JSON.parse(sessionsResult.content[0].text);
    console.log('Active Sessions:', JSON.stringify(sessionsData, null, 2));

    const session = sessionsData.sessions?.[0];
    if (!session) {
        throw new Error('No active browser sessions found. Make sure the site is open in Reticle drive.');
    }
    const sessionId = session.sessionId;
    console.log(`Using sessionId: ${sessionId}`);

    const auditResults = {};
    const routes = [
        { name: 'home', url: 'http://localhost:3000/' },
        { name: 'shop', url: 'http://localhost:3000/shop' },
        { name: 'cart', url: 'http://localhost:3000/cart' },
        { name: 'checkout', url: 'http://localhost:3000/checkout' }
    ];

    let activeSessionId = sessionId;

    for (const route of routes) {
        console.log(`\n--- Auditing Route: ${route.name} (${route.url}) ---`);
        
        // Navigate
        console.log(`Navigating to ${route.url} using session ${activeSessionId}...`);
        await callTool('reticle_navigate', { url: route.url, sessionId: activeSessionId });

        // Wait for page load and compilation
        console.log('Waiting 8 seconds for page compilation and load...');
        await new Promise(res => setTimeout(res, 8000));

        // Get new session ID because navigation/page-load connects a new session
        const currentSessionsResult = await callTool('reticle_sessions', {});
        const currentSessionsData = JSON.parse(currentSessionsResult.content[0].text);
        const newSession = currentSessionsData.sessions?.[0];
        if (!newSession) {
            console.error('No active session found after navigation!');
            continue;
        }
        activeSessionId = newSession.sessionId;
        console.log(`Resolved new active session ID: ${activeSessionId}`);

        // Get console logs
        console.log('Fetching console logs...');
        const consoleResponse = await callTool('reticle_console', { sessionId: activeSessionId, limit: 100 });
        const logs = JSON.parse(consoleResponse.content[0].text).logs || [];

        // Get network payloads
        console.log('Fetching network payloads...');
        const networkResponse = await callTool('reticle_network', { sessionId: activeSessionId, limit: 100 });
        const calls = JSON.parse(networkResponse.content[0].text).calls || [];

        // Get snapshot to see if page rendered correctly
        console.log('Fetching ARIA accessibility snapshot...');
        const snapshotResponse = await callTool('reticle_snapshot', { sessionId: activeSessionId, mode: 'interactive' });
        const snapshot = JSON.parse(snapshotResponse.content[0].text);

        auditResults[route.name] = {
            url: route.url,
            logs,
            calls,
            snapshot
        };

        console.log(`Logs count: ${logs.length}`);
        console.log(`Network calls count: ${calls.length}`);
        
        // Print errors if any
        const errors = logs.filter(l => l.level === 'error' || l.level === 'exception');
        if (errors.length > 0) {
            console.log(`Found ${errors.length} console errors:`);
            console.log(JSON.stringify(errors, null, 2));
        } else {
            console.log('No console errors found on this page.');
        }

        const warnings = logs.filter(l => l.level === 'warning' || l.level === 'warn');
        if (warnings.length > 0) {
            console.log(`Found ${warnings.length} console warnings.`);
        }
    }

    // Write audit report
    const reportPath = path.join(process.cwd(), 'reticle_audit_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2), 'utf8');
    console.log(`\nAudit finished successfully. Full report saved to ${reportPath}`);

    // Close connection
    if (sseRequest) {
        sseRequest.destroy();
    }
}

main().catch(err => {
    console.error('Audit failed with error:', err);
    process.exit(1);
});
