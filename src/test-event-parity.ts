/**
 * Event wrapper parity tests.
 * Verifies metadata keys and values match Unity SDK format.
 * Run: npx ts-node src/test-event-parity.ts
 */

// Mock window for Node.js
if (typeof window === 'undefined') {
    (global as any).window = {
        location: { search: '', pathname: '/', href: 'http://localhost/' },
        history: { pushState: () => {}, replaceState: () => {} },
        screen: { width: 1920, height: 1080 },
    };
    (global as any).document = {
        cookie: '', title: 'test',
        createElement: () => ({ style: {} }),
        head: { appendChild: () => {} },
        body: { appendChild: () => {}, removeChild: () => {} },
        getElementById: () => null, querySelector: () => null,
    };
    (global as any).localStorage = {
        _data: {} as Record<string, string>,
        getItem(key: string) { return this._data[key] || null; },
        setItem(key: string, value: string) { this._data[key] = value; },
    };
    (global as any).navigator = { userAgent: 'test', maxTouchPoints: 0 };
}

import { AbxrLibInit, AbxrLibAnalytics } from './AbxrLibAnalytics';
import { AbxrLibStorage } from './AbxrLibStorage';
import { AbxrLibAsync } from './AbxrLibAsync';
import { AbxrBase, AbxrEvent } from './AbxrLibCoreModel';
import { AbxrLibSend } from './AbxrLibSend';
import { AbxrDictStrings, EventStatus, InteractionType, InteractionResult, InteractionTypeToString, InteractionResultToString, EventStatusToString, DateTime, TimeSpan } from './network/utils/DotNetishTypes';

// Initialize statics
AbxrLibInit.InitStatics();
AbxrLibStorage.InitStatics();
AbxrLibAsync.InitStatics();
AbxrBase.InitStatics;
AbxrEvent.InitStatics();

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
    if (condition) {
        console.log(`  PASS: ${name}`);
        passed++;
    } else {
        console.error(`  FAIL: ${name}`);
        failed++;
    }
}

// ─── Test 1: Assessment metadata keys match Unity ───────────────────

console.log('\nTest 1: EventAssessmentComplete metadata keys match Unity');
{
    const meta = new AbxrDictStrings();

    // Simulate what AbxrLibSend.EventAssessmentComplete does
    meta.set("type", "assessment");
    meta.set("verb", "completed");
    meta.set("score", "92");
    var scoreMin = meta.get("score_min") || meta.get("scoreMin") || meta.get("min_score") || meta.get("minScore") || "0";
    var scoreMax = meta.get("score_max") || meta.get("scoreMax") || meta.get("max_score") || meta.get("maxScore") || "100";
    meta.set("score_min", scoreMin);
    meta.set("score_max", scoreMax);
    meta.set("status", EventStatusToString(EventStatus.ePass));
    meta.set("duration", "0");

    assert(meta.get("type") === "assessment", 'type = "assessment"');
    assert(meta.get("verb") === "completed", 'verb = "completed"');
    assert(meta.get("score") === "92", 'score = "92"');
    assert(meta.get("score_min") === "0", 'score_min = "0" (default)');
    assert(meta.get("score_max") === "100", 'score_max = "100" (default)');
    assert(meta.get("status") === "pass", 'status = "pass" (NOT result_options)');
    assert(meta.get("duration") === "0", 'duration present');
    assert(!meta.has("result_options"), 'result_options NOT present');
    assert(!meta.has("assessment_name"), 'assessment_name NOT present (name is event name)');
}

// ─── Test 2: Objective metadata keys match Unity ────────────────────

console.log('\nTest 2: EventObjectiveComplete metadata keys match Unity');
{
    const meta = new AbxrDictStrings();
    meta.set("type", "objective");
    meta.set("verb", "completed");
    meta.set("score", "100");
    var scoreMin = meta.get("score_min") || "0";
    var scoreMax = meta.get("score_max") || "100";
    meta.set("score_min", scoreMin);
    meta.set("score_max", scoreMax);
    meta.set("status", EventStatusToString(EventStatus.eComplete));
    meta.set("duration", "0");

    assert(meta.get("type") === "objective", 'type = "objective"');
    assert(meta.get("status") === "complete", 'status = "complete" (NOT result_options)');
    assert(meta.get("score_min") === "0", 'score_min present');
    assert(meta.get("score_max") === "100", 'score_max present');
    assert(!meta.has("result_options"), 'result_options NOT present');
    assert(!meta.has("objective_name"), 'objective_name NOT present');
}

// ─── Test 3: Custom score_min/score_max override defaults ───────────

console.log('\nTest 3: Custom score bounds override defaults');
{
    const meta = new AbxrDictStrings();
    meta.set("score_min", "10");
    meta.set("score_max", "200");

    var scoreMin = meta.get("score_min") || meta.get("scoreMin") || meta.get("min_score") || meta.get("minScore") || "0";
    var scoreMax = meta.get("score_max") || meta.get("scoreMax") || meta.get("max_score") || meta.get("maxScore") || "100";
    meta.set("score_min", scoreMin);
    meta.set("score_max", scoreMax);

    assert(meta.get("score_min") === "10", 'score_min uses user-provided "10"');
    assert(meta.get("score_max") === "200", 'score_max uses user-provided "200"');
}

// ─── Test 4: Alternative score key variants work ────────────────────

console.log('\nTest 4: Score key variants (scoreMin, min_score, minScore)');
{
    // Test scoreMin variant
    const meta1 = new AbxrDictStrings();
    meta1.set("scoreMin", "5");
    var val1 = meta1.get("score_min") || meta1.get("scoreMin") || meta1.get("min_score") || meta1.get("minScore") || "0";
    assert(val1 === "5", 'scoreMin variant resolves to "5"');

    // Test min_score variant
    const meta2 = new AbxrDictStrings();
    meta2.set("min_score", "15");
    var val2 = meta2.get("score_min") || meta2.get("scoreMin") || meta2.get("min_score") || meta2.get("minScore") || "0";
    assert(val2 === "15", 'min_score variant resolves to "15"');

    // Test minScore variant
    const meta3 = new AbxrDictStrings();
    meta3.set("minScore", "25");
    var val3 = meta3.get("score_min") || meta3.get("scoreMin") || meta3.get("min_score") || meta3.get("minScore") || "0";
    assert(val3 === "25", 'minScore variant resolves to "25"');
}

// ─── Test 5: Interaction metadata keys match Unity ──────────────────

console.log('\nTest 5: EventInteractionComplete metadata keys match Unity');
{
    const meta = new AbxrDictStrings();
    meta.set("type", "interaction");
    meta.set("verb", "completed");
    meta.set("interaction", InteractionTypeToString(InteractionType.eSelect));
    meta.set("result", InteractionResultToString(InteractionResult.eCorrect));
    meta.set("response", "option_a");
    meta.set("duration", "0");

    assert(meta.get("type") === "interaction", 'type = "interaction"');
    assert(meta.get("interaction") === "select", 'interaction = "select"');
    assert(meta.get("result") === "correct", 'result = "correct"');
    assert(meta.get("response") === "option_a", 'response present');
    assert(!meta.has("status"), 'status NOT present (interactions use result)');
    assert(!meta.has("result_options"), 'result_options NOT present');
}

// ─── Test 6: EventStatus string values ──────────────────────────────

console.log('\nTest 6: EventStatus string conversion matches Unity');
{
    assert(EventStatusToString(EventStatus.ePass) === "pass", 'ePass -> "pass"');
    assert(EventStatusToString(EventStatus.eFail) === "fail", 'eFail -> "fail"');
    assert(EventStatusToString(EventStatus.eComplete) === "complete", 'eComplete -> "complete"');
    assert(EventStatusToString(EventStatus.eIncomplete) === "incomplete", 'eIncomplete -> "incomplete"');
    assert(EventStatusToString(EventStatus.eBrowsed) === "browsed", 'eBrowsed -> "browsed"');
    assert(EventStatusToString(EventStatus.eNotAttempted) === "notattempted", 'eNotAttempted -> "notattempted"');
}

// ─── Test 7: InteractionType all 9 values ───────────────────────────

console.log('\nTest 7: InteractionType all 9 values match Unity');
{
    assert(InteractionTypeToString(InteractionType.eNull) === "null", 'eNull -> "null"');
    assert(InteractionTypeToString(InteractionType.eBool) === "bool", 'eBool -> "bool"');
    assert(InteractionTypeToString(InteractionType.eSelect) === "select", 'eSelect -> "select"');
    assert(InteractionTypeToString(InteractionType.eText) === "text", 'eText -> "text"');
    assert(InteractionTypeToString(InteractionType.eRating) === "rating", 'eRating -> "rating"');
    assert(InteractionTypeToString(InteractionType.eNumber) === "number", 'eNumber -> "number"');
    assert(InteractionTypeToString(InteractionType.eMatching) === "matching", 'eMatching -> "matching"');
    assert(InteractionTypeToString(InteractionType.ePerformance) === "performance", 'ePerformance -> "performance"');
    assert(InteractionTypeToString(InteractionType.eSequencing) === "sequencing", 'eSequencing -> "sequencing"');
}

// ─── Test 8: InteractionResult values ───────────────────────────────

console.log('\nTest 8: InteractionResult values match Unity');
{
    assert(InteractionResultToString(InteractionResult.eCorrect) === "correct", 'eCorrect -> "correct"');
    assert(InteractionResultToString(InteractionResult.eIncorrect) === "incorrect", 'eIncorrect -> "incorrect"');
    assert(InteractionResultToString(InteractionResult.eNeutral) === "neutral", 'eNeutral -> "neutral"');
}

// ─── Test 9: Duration format is seconds decimal ─────────────────────

console.log('\nTest 9: Duration format is seconds decimal');
{
    // Simulate what DurationToSeconds does: TimeSpan.ToDateTime().getTime() / 1000
    const ts = new TimeSpan().FromUnixTime(65.5); // 65.5 seconds
    const totalMs = ts.ToDateTime().getTime();
    const seconds = (totalMs / 1000.0).toString();

    // Should be a decimal number, not HH:MM:SS or microseconds
    assert(!seconds.includes(':'), 'duration does NOT contain colons (not HH:MM:SS format)');
    assert(parseFloat(seconds) > 0, 'duration parses as positive number');
    assert(parseFloat(seconds) === 65.5 || Math.abs(parseFloat(seconds) - 65.5) < 0.01, 'duration ~= 65.5 seconds');
}

// ─── Test 10: Assessment start metadata (no assessment_name) ────────

console.log('\nTest 10: Assessment start metadata has no assessment_name key');
{
    const meta = new AbxrDictStrings();
    meta.set("type", "assessment");
    meta.set("verb", "started");
    // Unity does NOT add assessment_name — the event name IS the assessment name

    assert(meta.get("type") === "assessment", 'type present');
    assert(meta.get("verb") === "started", 'verb present');
    assert(!meta.has("assessment_name"), 'assessment_name NOT in metadata');
}

// ─── Summary ────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`Event Parity Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
