#!/usr/bin/env node
/*
{
"metadata": {
    "type": "script",
    "version": "1.0.1",
    "update": "2026-07-16",
    "description": "Analyze Copilot Chat session logs (main.jsonl and subagent logs) to produce a summary report with metrics, timeline, and agent flow diagram. Can be run standalone or triggered from a Stop hook.",
  }
}
*/

const fs = require('fs');
const path = require('path');

/**
 * Convert Unix timestamp (ms) to ISO 8601 format
 */
function timestampToISO(timestamp) {
    if (!timestamp) return null;
    return new Date(timestamp).toISOString();
}

/**
 * Parse JSONL file and return array of parsed objects
 */
function parseJSONL(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content
            .split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return [];
    }
}

/**
 * Calculate summary statistics from LLM requests
 */
function calculateSummary(llmRequests) {
    const summary = {
        totalLLMCalls: llmRequests.length,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokenConsumed: 0,
        totalCachedTokens: 0,
        totalDuration: 0,
    };

    llmRequests.forEach(req => {
        summary.totalInputTokens += req.attrs?.inputTokens || 0;
        summary.totalOutputTokens += req.attrs?.outputTokens || 0;
        summary.totalCachedTokens += req.attrs?.cachedTokens || 0;
        summary.totalDuration += req.dur || 0;
    });

    const totalTokens = summary.totalInputTokens + summary.totalOutputTokens;
    summary.totalTokenConsumed = totalTokens;
    return summary;
}

/**
 * Process a child session (subagent) log file
 */
function processChildSession(logDir, childRef, parentTimestamp, depth = 1) {
    const childLogPath = path.join(logDir, childRef.attrs.childLogFile);
    
    if (!fs.existsSync(childLogPath)) {
        console.error(`Warning: Child log file not found: ${childLogPath}`);
        return null;
    }

    const childEvents = parseJSONL(childLogPath);
    
    // Find subagent info
    const subagentEvent = childEvents.find(e => e.type === 'subagent');
    const sessionStart = childEvents.find(e => e.type === 'session_start');
    
    // Extract all LLM requests from child session
    const llmRequests = childEvents.filter(e => e.type === 'llm_request');
    
    // Build timeline for child session
    const timeline = [];
    let seqCounter = 1;
    
    // Process all events in chronological order
    childEvents.forEach(event => {
        if (event.type === 'llm_request') {
            timeline.push({
                seq: seqCounter++,
                type: 'llm_request',
                timestamp: timestampToISO(event.ts),
                duration: event.dur,
                model: event.attrs?.model || 'unknown',
                inputTokens: event.attrs?.inputTokens || 0,
                outputTokens: event.attrs?.outputTokens || 0,
                cachedTokens: event.attrs?.cachedTokens || 0,
                ttft: event.attrs?.ttft || 0,
                spanId: event.spanId,
                parentSpanId: event.parentSpanId,
                debugName: event.attrs?.debugName
            });
        } else if (event.type === 'child_session_ref') {
            // Recursive: process nested subagent
            const nestedChild = processChildSession(logDir, event, event.ts, depth + 1);
            if (nestedChild) {
                timeline.push({
                    seq: seqCounter++,
                    ...nestedChild
                });
            }
        }
    });

    return {
        type: 'subagent',
        depth: depth,
        timestamp: timestampToISO(childRef.ts),
        agentName: subagentEvent?.attrs?.agentName || childRef.attrs?.label || 'unknown',
        description: subagentEvent?.attrs?.description || '',
        sessionId: childRef.attrs.childSessionId,
        logFile: childRef.attrs.childLogFile,
        spanId: childRef.spanId,
        parentSpanId: childRef.parentSpanId,
        summary: calculateSummary(llmRequests),
        timeline: timeline
    };
}

/**
 * Calculate summary for main session only (excludes subagents)
 */
function calculateMainSessionSummary(timeline) {
    const summary = {
        totalLLMCalls: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokenConsumed: 0,
        totalCachedTokens: 0,
        totalDuration: 0
    };

    timeline.forEach(item => {
        if (item.type === 'llm_request') {
            summary.totalLLMCalls += 1;
            summary.totalInputTokens += item.inputTokens || 0;
            summary.totalOutputTokens += item.outputTokens || 0;
            summary.totalCachedTokens += item.cachedTokens || 0;
            summary.totalDuration += item.duration || 0;
        }
    });

    summary.totalTokenConsumed = summary.totalInputTokens + summary.totalOutputTokens;

    return summary;
}

/**
 * Calculate global summary including all subagents recursively
 */
function calculateGlobalSummary(timeline) {
    const total = {
        totalLLMCalls: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokenConsumed: 0,
        totalCachedTokens: 0,
        totalDuration: 0
    };

    const uiOnlySessions = ['title', 'categorization', 'summarize'];

    timeline.forEach(item => {
        if (item.type === 'llm_request') {
            total.totalLLMCalls += 1;
            total.totalInputTokens += item.inputTokens || 0;
            total.totalOutputTokens += item.outputTokens || 0;
            total.totalCachedTokens += item.cachedTokens || 0;
            total.totalDuration += item.duration || 0;
        } else if (item.type === 'subagent' && item.summary) {
            // Skip UI-only sessions from summary totals
            if (uiOnlySessions.includes(item.agentName)) {
                return;
            }
            // Add subagent's summary to total
            total.totalLLMCalls += item.summary.totalLLMCalls;
            total.totalInputTokens += item.summary.totalInputTokens;
            total.totalOutputTokens += item.summary.totalOutputTokens;
            total.totalCachedTokens += item.summary.totalCachedTokens;
            total.totalDuration += item.summary.totalDuration;
        }
    });

    total.totalTokenConsumed = total.totalInputTokens + total.totalOutputTokens;

    return total;
}

/**
 * Main function to analyze session logs
 */
function analyzeSession(mainLogPath) {
    const logDir = path.dirname(mainLogPath);
    const events = parseJSONL(mainLogPath);

    if (events.length === 0) {
        console.error('No events found in log file');
        return null;
    }

    // Extract session info
    const sessionStart = events.find(e => e.type === 'session_start');
    const userMessages = events.filter(e => e.type === 'user_message');
    const llmRequests = events.filter(e => e.type === 'llm_request');
    const childRefs = events.filter(e => e.type === 'child_session_ref');

    // Build main timeline
    const timeline = [];
    let seqCounter = 1;

    // Merge and sort all main events by timestamp
    const mainEvents = [
        ...llmRequests.map(e => ({ ...e, eventType: 'llm' })),
        ...childRefs.map(e => ({ ...e, eventType: 'child' }))
    ].sort((a, b) => a.ts - b.ts);

    mainEvents.forEach(event => {
        if (event.eventType === 'llm') {
            timeline.push({
                seq: seqCounter++,
                type: 'llm_request',
                timestamp: timestampToISO(event.ts),
                duration: event.dur,
                model: event.attrs?.model || 'unknown',
                inputTokens: event.attrs?.inputTokens || 0,
                outputTokens: event.attrs?.outputTokens || 0,
                cachedTokens: event.attrs?.cachedTokens || 0,
                ttft: event.attrs?.ttft || 0,
                spanId: event.spanId,
                parentSpanId: event.parentSpanId,
                debugName: event.attrs?.debugName,
                turnId: events.find(e => 
                    e.type === 'turn_start' && 
                    e.ts <= event.ts && 
                    e.parentSpanId === event.parentSpanId
                )?.attrs?.turnId
            });
        } else if (event.eventType === 'child') {
            const childData = processChildSession(logDir, event, event.ts);
            if (childData) {
                timeline.push({
                    seq: seqCounter++,
                    ...childData
                });
            }
        }
    });

    // Calculate session times
    const sessionStartTime = sessionStart?.ts;
    const allTimestamps = events.map(e => e.ts).filter(Boolean);
    const sessionEndTime = allTimestamps.length > 0 ? Math.max(...allTimestamps) : sessionStartTime;
    
    // Extract session title from JSONL metadata record and session goal from first user message
    const sessionMeta = events.find(e => e.sessionName);
    const firstMessage = userMessages[0]?.attrs?.content || '';
    const sessionName = sessionMeta?.sessionName
        || firstMessage.substring(0, 100)
        || `Session ${sessionStart?.sid?.substring(0, 8) || 'unknown'}`;

    // Build final result
    const result = {
        sessionId: sessionStart?.sid || 'unknown',
        sessionName: sessionName,
        sessionStartTime: timestampToISO(sessionStartTime),
        sessionEndTime: timestampToISO(sessionEndTime),
        copilotVersion: sessionStart?.attrs?.copilotVersion,
        vscodeVersion: sessionStart?.attrs?.vscodeVersion,
        logFile: path.basename(mainLogPath),
        userMessages: userMessages.map(m => ({
            timestamp: timestampToISO(m.ts),
            content: m.attrs?.content
        })),
        summary: calculateMainSessionSummary(timeline),
        summaryGlobal: calculateGlobalSummary(timeline),
        timeline: timeline
    };

    return result;
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
}

/**
 * Print summary report
 */
function printSummary(analysis) {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                   SESSION ANALYSIS SUMMARY                 ');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`Session ID: ${analysis.sessionId}`);
    console.log(`Session Name: ${analysis.sessionName}`);
    console.log(`Session Start: ${analysis.sessionStartTime}`);
    console.log(`Session End: ${analysis.sessionEndTime}`);
    console.log(`Copilot Version: ${analysis.copilotVersion}`);
    console.log(`VS Code Version: ${analysis.vscodeVersion}`);
    console.log(`Log File: ${analysis.logFile}\n`);
    
    console.log('User Messages:');
    analysis.userMessages.forEach((msg, i) => {
        console.log(`  ${i + 1}. ${msg.content}`);
    });
    
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│              MAIN SESSION METRICS                       │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│ Total LLM Calls:      ${String(analysis.summary.totalLLMCalls).padStart(30)} │`);
    console.log(`│ Total Input Tokens:   ${String(analysis.summary.totalInputTokens.toLocaleString()).padStart(30)} │`);
    console.log(`│ Total Output Tokens:  ${String(analysis.summary.totalOutputTokens.toLocaleString()).padStart(30)} │`);
    console.log(`│ Total Cached Tokens:  ${String(analysis.summary.totalCachedTokens.toLocaleString()).padStart(30)} │`);
    console.log(`│ Total Tokens:         ${String(analysis.summary.totalTokenConsumed.toLocaleString()).padStart(30)} │`);
    console.log(`│ Total Duration:       ${String(formatDuration(analysis.summary.totalDuration)).padStart(30)} │`);
    console.log('└─────────────────────────────────────────────────────────┘\n');
    
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│         GLOBAL METRICS (Main + Subagents)              │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│ Total LLM Calls:      ${String(analysis.summaryGlobal.totalLLMCalls).padStart(30)} │`);
    console.log(`│ Total Input Tokens:   ${String(analysis.summaryGlobal.totalInputTokens.toLocaleString()).padStart(30)} │`);
    console.log(`│ Total Output Tokens:  ${String(analysis.summaryGlobal.totalOutputTokens.toLocaleString()).padStart(30)} │`);
    console.log(`│ Total Cached Tokens:  ${String(analysis.summaryGlobal.totalCachedTokens.toLocaleString()).padStart(30)} │`);
    console.log(`│ Total Tokens:         ${String(analysis.summaryGlobal.totalTokenConsumed.toLocaleString()).padStart(30)} │`);
    console.log(`│ Total Duration:       ${String(formatDuration(analysis.summaryGlobal.totalDuration)).padStart(30)} │`);
    console.log('└─────────────────────────────────────────────────────────┘');
    
    console.log('\n───────────────────────────────────────────────────────────');
    console.log('                    EXECUTION TIMELINE                     ');
    console.log('───────────────────────────────────────────────────────────\n');
    
    function printTimeline(timeline, indent = 0) {
        timeline.forEach(item => {
            const prefix = '  '.repeat(indent);
            
            if (item.type === 'llm_request') {
                console.log(`${prefix}[${item.seq}] LLM Request: ${item.model}`);
                console.log(`${prefix}    Duration: ${formatDuration(item.duration)} | TTFT: ${item.ttft}ms`);
                console.log(`${prefix}    Tokens: ${item.inputTokens} in | ${item.outputTokens} out | ${item.cachedTokens} cached`);
            } else if (item.type === 'subagent') {
                console.log(`${prefix}[${item.seq}] ╔═══ Subagent: ${item.agentName}`);
                if (item.description) {
                    console.log(`${prefix}     ║ Description: ${item.description}`);
                }
                console.log(`${prefix}     ║ Session: ${item.sessionId}`);
                console.log(`${prefix}     ║ LLM Calls: ${item.summary.totalLLMCalls} | Duration: ${formatDuration(item.summary.totalDuration)}`);
                console.log(`${prefix}     ║ Tokens: ${item.summary.totalInputTokens} in | ${item.summary.totalOutputTokens} out | ${item.summary.totalCachedTokens} cached`);
                
                if (item.timeline && item.timeline.length > 0) {
                    console.log(`${prefix}     ╠═══ Subagent Timeline:`);
                    printTimeline(item.timeline, indent + 2);
                }
                console.log(`${prefix}     ╚═══ End of ${item.agentName}\n`);
            }
        });
    }
    
    printTimeline(analysis.timeline);
    
    console.log('═══════════════════════════════════════════════════════════\n');
}

/**
 * Read git user config (email and name) from the current working directory.
 * Returns null values if git is not available or not configured.
 */
function getGitUser(cwd) {
    const { execSync } = require('child_process');
    const opts = { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], cwd };
    try {
        const email = execSync('git config user.email', opts).trim();
        const name  = execSync('git config user.name',  opts).trim();
        return { email: email || null, name: name || null };
    } catch {
        return { email: null, name: null };
    }
}

/**
 * Generate a Mermaid flowchart TD showing agent/subagent call hierarchy.
 * UI-only agents (title, categorization, summarize) are excluded.
 */
function generateFlowchart(timeline) {
    const uiOnlySessions = new Set(['title', 'categorization', 'summarize']);
    let nodeCounter = 0;
    const nodeLines = ['    Agent(["Agent"])'];
    const edgeLines = [];

    function processSubagents(items, parentId) {
        (items || [])
            .filter(item => item.type === 'subagent' && !uiOnlySessions.has(item.agentName))
            .forEach(item => {
                nodeCounter++;
                const safeId = item.agentName.replace(/[^a-zA-Z0-9]/g, '') + nodeCounter;
                nodeLines.push(`    ${safeId}(["${item.agentName}"])`);
                edgeLines.push(`    ${parentId} --${nodeCounter}--> ${safeId}`);
                processSubagents(item.timeline, safeId);
            });
    }

    processSubagents(timeline, 'Agent');

    return [
        '```mermaid',
        'flowchart LR',
        ...nodeLines,
        '',
        ...edgeLines,
        '```'
    ].join('\n');
}

/**
 * Generate a Markdown file with YAML frontmatter from an analysis object.
 */
function generateMarkdownReport(analysis) {
    const g = analysis.summaryGlobal;

    // Collect model usage stats recursively across all timeline nodes
    function collectModels(timeline, acc = {}) {
        (timeline || []).forEach(item => {
            if (item.type === 'llm_request') {
                const m = item.model || 'unknown';
                if (!acc[m]) acc[m] = { calls: 0, inputTokens: 0, outputTokens: 0, cachedTokens: 0 };
                acc[m].calls++;
                acc[m].inputTokens  += item.inputTokens  || 0;
                acc[m].outputTokens += item.outputTokens || 0;
                acc[m].cachedTokens += item.cachedTokens || 0;
            } else if (item.type === 'subagent') {
                collectModels(item.timeline, acc);
            }
        });
        return acc;
    }

    const modelsMap = collectModels(analysis.timeline);
    const modelLines = Object.entries(modelsMap).flatMap(([name, s]) => [
        `  - name: ${name}`,
        `    calls: ${s.calls}`,
        `    inputTokens: ${s.inputTokens}`,
        `    outputTokens: ${s.outputTokens}`,
        `    cachedTokens: ${s.cachedTokens}`,
        `    totalTokenConsumed: ${s.inputTokens + s.outputTokens}`,
    ]);

    // Recursively render subagent nodes as indented YAML list entries
    function renderSubagents(timeline, indent) {
        const prefix = ' '.repeat(indent);
        const lines = [];
        (timeline || [])
            .filter(item => item.type === 'subagent')
            .forEach(item => {
                lines.push(`${prefix}- agentName: ${item.agentName}`);
                lines.push(`${prefix}  startTime: "${item.timestamp}"`);
                lines.push(`${prefix}  durationMs: ${item.summary?.totalDuration ?? 0}`);
                const nested = (item.timeline || []).filter(n => n.type === 'subagent');
                if (nested.length > 0) {
                    lines.push(`${prefix}  timeline:`);
                    lines.push(...renderSubagents(item.timeline, indent + 4));
                }
            });
        return lines;
    }

    const subagentLines = renderSubagents(analysis.timeline, 2);

    const frontmatter = [
        '---',
        `sessionId: "${analysis.sessionId}"`,
        `type: "observability"`,
        `sessionName: "${(analysis.sessionName || '').replace(/"/g, "'")}"`,
        `sessionStartTime: "${analysis.sessionStartTime}"`,
        `sessionEndTime: "${analysis.sessionEndTime}"`,
        `copilotVersion: "${analysis.copilotVersion}"`,
        `vscodeVersion: "${analysis.vscodeVersion}"`,
        'summaryGlobal:',
        `  totalLLMCalls: ${g.totalLLMCalls}`,
        `  totalInputTokens: ${g.totalInputTokens}`,
        `  totalOutputTokens: ${g.totalOutputTokens}`,
        `  totalCachedTokens: ${g.totalCachedTokens}`,
        `  totalTokenConsumed: ${g.totalInputTokens + g.totalOutputTokens}`,
        'gitUser:',
        `  email: "${analysis.gitUser?.email || ''}"`,
        `  name: "${analysis.gitUser?.name || ''}"`,
        'models:',
        ...(modelLines.length > 0 ? modelLines : ['  []']),
        'timeline:',
        ...(subagentLines.length > 0 ? subagentLines : ['  []']),
        '---',
        ''
    ].join('\n');

    // Append agent flow diagram only when subagents were involved
    const hasSubagents = (analysis.timeline || [])
        .some(item => item.type === 'subagent' && !['title', 'categorization', 'summarize'].includes(item.agentName));

    const body = hasSubagents
        ? `\n## Agent Flow\n\n${generateFlowchart(analysis.timeline)}\n`
        : '';

    return frontmatter + body;
}

/**
 * Derive the debug-logs main.jsonl path from the hook's transcript_path.
 *
 * transcript_path: .../<workspace>/GitHub.copilot-chat/transcripts/<session_id>.jsonl
 * debug log:       .../<workspace>/GitHub.copilot-chat/debug-logs/<session_id>/main.jsonl
 */
function deriveDebugLogPath(transcriptPath, sessionId) {
    const transcriptsDir = path.dirname(transcriptPath);          // .../transcripts
    const copilotChatDir = path.dirname(transcriptsDir);           // .../GitHub.copilot-chat
    return path.join(copilotChatDir, 'debug-logs', sessionId, 'main.jsonl');
}

/**
 * Run analysis triggered from a hook Stop event via stdin.
 * Reads hook JSON input, derives the debug log path, runs analysis,
 * and saves the result to session-reports/<session_id>.json in the workspace cwd.
 */
function runFromStdin() {
    let rawInput = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { rawInput += chunk; });
    process.stdin.on('end', () => {
        let hookInput;
        try {
            hookInput = JSON.parse(rawInput.trim() || '{}');
        } catch (err) {
            process.stderr.write(`analyze-session-logs: invalid stdin JSON - ${err.message}\n`);
            process.exit(1);
        }

        // Avoid running indefinitely if the hook itself triggers a new Stop
        if (hookInput.stop_hook_active) {
            process.exit(0);
        }

        const sessionId = hookInput.session_id;
        const transcriptPath = hookInput.transcript_path;
        const workspaceCwd = hookInput.cwd || process.cwd();

        if (!sessionId || !transcriptPath) {
            process.stderr.write('analyze-session-logs: missing session_id or transcript_path in hook input\n');
            process.exit(1);
        }

        const debugLogPath = deriveDebugLogPath(transcriptPath, sessionId);

        if (!fs.existsSync(debugLogPath)) {
            process.stderr.write(`analyze-session-logs: debug log not found: ${debugLogPath}\n`);
            process.exit(0); // Non-blocking: exit 0 so the hook does not block the agent
        }

        const analysis = analyzeSession(debugLogPath);
        if (!analysis) {
            process.stderr.write('analyze-session-logs: failed to analyze session\n');
            process.exit(0);
        }

        analysis.gitUser = getGitUser(workspaceCwd);

        // Write report to metrics/<session_id_10digits>.jsonl in the workspace
        const metricsDir = path.join(workspaceCwd, 'metrics');
        if (!fs.existsSync(metricsDir)) {
            fs.mkdirSync(metricsDir, { recursive: true });
        }

        const startIso = analysis.sessionStartTime || new Date().toISOString();
        const datePrefix = startIso.substring(0, 10).replace(/-/g, '');
        const timePrefix = startIso.substring(11, 19).replace(/:/g, '');
        const sessionId10 = sessionId.substring(0, 8);
        const reportPath = path.join(metricsDir, `${datePrefix}${timePrefix}-${sessionId10}.json`);
        
        // Write as JSONL: one JSON object per line
        fs.writeFileSync(reportPath, JSON.stringify(analysis) + '\n', 'utf8');

        // Write companion Markdown report with frontmatter
        const mdPath = reportPath.replace(/\.json$/, '.md');
        fs.writeFileSync(mdPath, generateMarkdownReport(analysis), 'utf8');

        // Brief stdout so the hook output panel shows something useful
        const g = analysis.summaryGlobal;
        const userLabel = analysis.gitUser?.email || analysis.gitUser?.name || 'unknown';
        process.stdout.write(
            `[metrics] session=${sessionId.substring(0, 8)}... ` +
            `user=${userLabel} ` +
            `llm_calls=${g.totalLLMCalls} ` +
            `tokens_in=${g.totalInputTokens.toLocaleString()} ` +
            `tokens_out=${g.totalOutputTokens.toLocaleString()} ` +
            `report=${reportPath}\n`
        );

        process.exit(0);
    });
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--stdin')) {
        runFromStdin();
    } else {
        if (args.length === 0) {
            console.error('Usage: node analyze-session-logs.js <path-to-main.jsonl> [--json]');
            console.error('       node analyze-session-logs.js --stdin   (called from a Stop hook)');
            console.error('');
            console.error('Options:');
            console.error('  --json    Output raw JSON instead of formatted summary');
            console.error('  --stdin   Read hook Stop input from stdin and auto-derive log path');
            console.error('');
            console.error('Example:');
            console.error('  node analyze-session-logs.js "C:/path/to/main.jsonl"');
            console.error('  node analyze-session-logs.js "C:/path/to/main.jsonl" --json > output.json');
            process.exit(1);
        }

        const logPath = args[0];
        const jsonOutput = args.includes('--json');

        if (!fs.existsSync(logPath)) {
            console.error(`Error: File not found: ${logPath}`);
            process.exit(1);
        }

        const analysis = analyzeSession(logPath);

        if (!analysis) {
            console.error('Failed to analyze session logs');
            process.exit(1);
        }

        if (jsonOutput) {
            console.log(JSON.stringify(analysis, null, 2));
        } else {
            printSummary(analysis);
        }
    }
}

module.exports = { analyzeSession, calculateSummary };
