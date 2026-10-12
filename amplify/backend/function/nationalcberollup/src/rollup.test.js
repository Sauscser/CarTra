const assert = require('node:assert/strict');
const { GetItemCommand, TransactWriteItemsCommand } = require('@aws-sdk/client-dynamodb');
const { __test } = require('./index');

const rows = new Map();
const keyOf = (key) => key.id.S;
const decode = (item) => item && Object.fromEntries(Object.entries(item).map(([key, value]) => [
  key,
  value.S ?? (value.N !== undefined ? Number(value.N) : value.NULL ? null : undefined),
]));

const db = {
  async send(command) {
    if (command instanceof GetItemCommand) return { Item: rows.get(keyOf(command.input.Key)) };
    assert.ok(command instanceof TransactWriteItemsCommand);
    for (const operation of command.input.TransactItems) {
      if (operation.Put) {
        const id = keyOf(operation.Put.Item);
        const current = rows.get(id);
        const sequence = operation.Put.Item.lastSequence?.S;
        if (current && current.lastSequence?.S >= sequence) {
          const error = new Error('checkpoint already applied');
          error.name = 'TransactionCanceledException';
          error.CancellationReasons = [{ Code: 'ConditionalCheckFailed' }];
          throw error;
        }
      }
    }
    for (const operation of command.input.TransactItems) {
      if (operation.Put) {
        rows.set(keyOf(operation.Put.Item), operation.Put.Item);
        continue;
      }
      const update = operation.Update;
      const id = keyOf(update.Key);
      const item = rows.get(id) || { id: update.Key.id };
      const values = update.ExpressionAttributeValues;
      const names = update.ExpressionAttributeNames;
      const fields = [
        ['nationGradeKey', ':partition'], ['academicYear', ':year'], ['dimension', ':dimension'],
        ['binKey', ':bin'], ['subjectId', ':subjectId'], ['subjectName', ':subjectName'],
      ];
      for (const [field, token] of fields) item[field] = values[token];
      item.deviationSum = { N: String(Number(item.deviationSum?.N || 0) + Number(values[':sum'].N)) };
      item.deviationSquares = { N: String(Number(item.deviationSquares?.N || 0) + Number(values[':squares'].N)) };
      const countField = Object.keys(names).find((name) => names[name] === 'count');
      item.count = { N: String(Number(item.count?.N || 0) + Number(values[':count'].N)) };
      assert.ok(countField);
      rows.set(id, item);
    }
    return {};
  },
};

const fact = (overrides = {}) => ({
  id: 'L1#10#MATH#2026#EOY',
  learnerId: 'L1',
  subjectId: 'MATH',
  subjectName: 'Mathematics',
  gradeLevel: 10,
  academicYear: '2026',
  termOrCycle: 'EndOfYear',
  nationCode: 'KE',
  achievedMark: 80,
  targetMark: 70,
  ...overrides,
});
const image = (value) => Object.fromEntries(Object.entries(value).map(([key, item]) => [
  key,
  item === null || item === undefined ? { NULL: true } : typeof item === 'number' ? { N: String(item) } : { S: String(item) },
]));
const event = (value, sequence, eventName = 'INSERT') => ({
  eventName,
  eventID: `event-${sequence}`,
  dynamodb: { SequenceNumber: String(sequence), NewImage: image(value) },
});

async function run() {
  await __test.processRecord(event(fact(), 1), db);
  const initialSubjectBins = Array.from(rows.values()).filter((row) => row.dimension?.S === 'MARK#MATH');
  assert.equal(initialSubjectBins.length, 1);
  assert.equal(Number(initialSubjectBins[0].count.N), 1);

  await __test.processRecord(event(fact(), 1), db);
  assert.equal(Number(initialSubjectBins[0].count.N), 1, 'duplicate stream event must not double count');

  await __test.processRecord(event(fact({ achievedMark: 60 }), 2, 'MODIFY'), db);
  const mark80 = Array.from(rows.values()).find((row) => row.dimension?.S === 'MARK#MATH' && row.binKey?.S === '80');
  const mark60 = Array.from(rows.values()).find((row) => row.dimension?.S === 'MARK#MATH' && row.binKey?.S === '60');
  assert.equal(Number(mark80.count.N), 0, 'corrected mark removes its old bin contribution');
  assert.equal(Number(mark60.count.N), 1, 'corrected mark adds its new bin contribution');

  const clusterId = 'L1#10#__ANNUAL_CLUSTER__#2026#EOY';
  const cluster = fact({ id: clusterId, subjectId: '__ANNUAL_CLUSTER__', subjectName: 'Annual course cluster', achievedMark: 6, targetMark: 5, tertiaryBenchmark: 4 });
  await __test.processRecord(event(cluster, 3), db);
  assert.ok(Array.from(rows.values()).some((row) => row.dimension?.S === 'CLUSTER_PERSONAL_DEVIATION_EXCLUDING_SUPPORT'));
  assert.ok(Array.from(rows.values()).some((row) => row.dimension?.S === 'CLUSTER_TERTIARY_DEVIATION_EXCLUDING_SUPPORT'));

  const incomplete = fact({ id: clusterId, subjectId: '__ANNUAL_CLUSTER__', achievedMark: null, targetMark: null, tertiaryBenchmark: null });
  await __test.processRecord(event(incomplete, 4, 'MODIFY'), db);
  const personalClusterRows = Array.from(rows.values()).filter((row) => row.dimension?.S === 'CLUSTER_PERSONAL_DEVIATION_EXCLUDING_SUPPORT');
  assert.ok(personalClusterRows.every((row) => Number(row.count.N) === 0), 'incomplete correction removes stale cluster contributions');

  await __test.processRecord(event(fact({ id: 'legacy-term', termOrCycle: 'Term 1' }), 5), db);
  const legacyCheckpoint = rows.get(`CHECKPOINT#${encodeURIComponent('legacy-term')}`);
  assert.ok(legacyCheckpoint, 'nonannual source events are checkpointed');
  assert.equal(Array.from(rows.values()).filter((row) => row.dimension?.S?.startsWith('MARK#')).length, 2, 'term-labelled row is excluded from annual marks');

  console.log('National CBE rollup tests passed: annual insert, duplicate delivery, correction delta, cluster comparisons, incomplete cluster clearing, and term exclusion.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
