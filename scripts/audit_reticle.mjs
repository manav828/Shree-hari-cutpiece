import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

async function main() {
    const home = os.homedir();
    const tokenFile = path.join(home, '.reticle', 'pairing-token');
    if (!fs.existsSync(tokenFile)) {
        console.error('Reticle pairing token not found at ' + tokenFile);
        process.exit(1);
    }
    const token = fs.readFileSync(tokenFile, 'utf8').trim();
    console.log('Read pairing token successfully.');

    const client = new Client(
        { name: 'reticle-audit-agent', version: '1.0.0' },
        { capabilities: {} }
    );

    const transport = new SSEClientTransport(new URL(`http://localhost:4400/mcp/sse?token=${token}`));
    
    console.log('Connecting to Reticle daemon MCP server...');
    await client.connect(transport);
    console.log('Connected to Reticle daemon.');

    // 1. Get sessions
    const sessionsResponse = await client.callTool({
        name: 'reticle_sessions',
        arguments: {}
    });
    
    const sessionsData = JSON.parse(sessionsResponse.content[0].text);
    console.log('Active sessions:', JSON.stringify(sessionsData, null, 2));

    const session = sessionsData.sessions?.[0];
    if (!session) {
        console.error('No active browser sessions found! Make sure the browser is connected.');
        await transport.close();
        process.exit(1);
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

    for (const route of routes) {
        console.log(`\n--- Auditing Route: ${route.name} (${route.url}) ---`);
        
        // Navigate
        console.log(`Navigating to ${route.url}...`);
        await client.callTool({
            name: 'reticle_navigate',
            arguments: {
                url: route.url,
                sessionId
            }
        });

        // Wait for page load and compilation
        console.log('Waiting 4 seconds for page compilation and load...');
        await new Promise(resolve => setTimeout(resolve, 4000));

        // Get console logs
        console.log('Fetching console logs...');
        const consoleResponse = await client.callTool({
            name: 'reticle_console',
            arguments: {
                sessionId,
                limit: 100
            }
        });
        const logs = JSON.parse(consoleResponse.content[0].text).logs || [];

        // Get network payloads
        console.log('Fetching network payloads...');
        const networkResponse = await client.callTool({
            name: 'reticle_network',
            arguments: {
                sessionId,
                limit: 100
            }
        });
        const calls = JSON.parse(networkResponse.content[0].text).calls || [];

        // Get snapshot to see if page rendered correctly
        console.log('Fetching ARIA accessibility snapshot...');
        const snapshotResponse = await client.callTool({
            name: 'reticle_snapshot',
            arguments: {
                sessionId,
                mode: 'status'
            }
        });
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

    await transport.close();
}

main().catch(err => {
    console.error('Audit failed with error:', err);
    process.exit(1);
});
