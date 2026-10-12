'use strict';

const { DynamoDBClient, GetItemCommand, TransactWriteItemsCommand } = require('@aws-sdk/client-dynamodb');
const dynamo = new DynamoDBClient({});
const rollupTable = process.env.ROLLUP_TABLE_NAME;

function attribute(value) {
  return value === null || value === undefined ? { NULL: true } : typeof value === 'number' ? { N: String(value) } : { S: String(value) };
}

function record(image) {
  if (!image) return null;
  return Object.fromEntries(Object.entries(image).map(([key, value]) => [
    key,
    value.S ?? (value.N !== undefined ? Number(value.N) : value.NULL ? null : undefined),
  ]));
}

function deviationBin(value) {
  if (value <= -100) return '-100';
  if (value >= 500) return '500+';
  return String(Math.floor(value / 5) * 5);
}

function createContributions(fact) {
  const contributions = new Map();
  const grade = Number(fact?.gradeLevel);
  const achievedValue = fact?.achievedMark;
  const achieved = Number(achievedValue);
  const target = Number(fact?.targetMark);
  if (!fact?.learnerId || !fact?.nationCode || !fact?.academicYear || String(fact?.termOrCycle || '').replace(/[^a-z]/gi, '').toLowerCase() !== 'endofyear' || !Number.isInteger(grade) || grade < 7 || grade > 12 || achievedValue === null || achievedValue === undefined || achievedValue === '' || !Number.isFinite(achieved) || achieved < 0) return contributions;

  const nationGradeKey = `${String(fact.nationCode).trim().toUpperCase()}#${grade}`;
  const add = (dimension, binKey, deviation, subjectId, subjectName) => {
    const id = [nationGradeKey, fact.academicYear, dimension, binKey].map(encodeURIComponent).join('#');
    const row = contributions.get(id) || { id, nationGradeKey, academicYear: String(fact.academicYear), dimension, binKey: String(binKey), subjectId: subjectId || null, subjectName: subjectName || null, count: 0, deviationSum: 0, deviationSquares: 0 };
    row.count += 1;
    if (Number.isFinite(deviation)) {
      row.deviationSum += deviation;
      row.deviationSquares += deviation * deviation;
    }
    contributions.set(id, row);
  };

  if (String(fact.subjectId) === '__ANNUAL_CLUSTER__') {
    if (Number.isFinite(target) && target > 0) {
      const deviation = ((achieved - target) / target) * 100;
      add('CLUSTER_PERSONAL_DEVIATION_EXCLUDING_SUPPORT', deviationBin(deviation), deviation);
    }
    const tertiaryTarget = Number(fact.tertiaryBenchmark);
    if (Number.isFinite(tertiaryTarget) && tertiaryTarget > 0) {
      const deviation = ((achieved - tertiaryTarget) / tertiaryTarget) * 100;
      add('CLUSTER_TERTIARY_DEVIATION_EXCLUDING_SUPPORT', deviationBin(deviation), deviation);
    }
    return contributions;
  }

  const subjectId = String(fact.subjectId || '');
  if (!subjectId) return contributions;
  const mark = Math.floor(Math.max(0, Math.min(100, achieved)));
  add(`MARK#${subjectId}`, mark, null, subjectId, fact.subjectName);
  if (Number.isFinite(target) && target > 0) {
    const deviation = ((achieved - target) / target) * 100;
    const binKey = deviationBin(deviation);
    add(`SUBJECT_DEVIATION#${subjectId}`, binKey, deviation, subjectId, fact.subjectName);
    add('PERSONAL_DEVIATION', binKey, deviation);
  }
  return contributions;
}

function mergeContributions(target, source, sign) {
  for (const [id, row] of source) {
    const delta = target.get(id) || { ...row, count: 0, deviationSum: 0, deviationSquares: 0 };
    delta.count += sign * row.count;
    delta.deviationSum += sign * row.deviationSum;
    delta.deviationSquares += sign * row.deviationSquares;
    target.set(id, delta);
  }
}

function rollupUpdate(row) {
  return {
    Update: {
      TableName: rollupTable,
      Key: { id: attribute(row.id) },
      UpdateExpression: 'SET nationGradeKey=:partition, academicYear=:year, #sort=:sort, #dimension=:dimension, binKey=:bin, subjectId=:subjectId, subjectName=:subjectName, createdAt=if_not_exists(createdAt,:createdAt), deviationSum=if_not_exists(deviationSum,:zero)+:sum, deviationSquares=if_not_exists(deviationSquares,:zero)+:squares, updatedAt=:updatedAt ADD #count :count',
      ExpressionAttributeNames: { '#sort': 'academicYear#dimension#binKey', '#dimension': 'dimension', '#count': 'count' },
      ExpressionAttributeValues: {
        ':partition': attribute(row.nationGradeKey),
        ':year': attribute(row.academicYear),
        ':sort': attribute(`${row.academicYear}#${row.dimension}#${row.binKey}`),
        ':dimension': attribute(row.dimension),
        ':bin': attribute(row.binKey),
        ':subjectId': attribute(row.subjectId),
        ':subjectName': attribute(row.subjectName),
        ':createdAt': attribute(new Date().toISOString()),
        ':zero': { N: '0' },
        ':sum': { N: String(row.deviationSum) },
        ':squares': { N: String(row.deviationSquares) },
        ':updatedAt': attribute(new Date().toISOString()),
        ':count': { N: String(row.count) },
      },
    },
  };
}

async function processRecord(streamRecord, client = dynamo) {
  if (streamRecord.eventName === 'REMOVE') return;
  const newFact = record(streamRecord.dynamodb?.NewImage);
  const sequence = String(streamRecord.dynamodb?.SequenceNumber || '').padStart(40, '0');
  if (!newFact || !sequence) return;
  const checkpointId = `CHECKPOINT#${encodeURIComponent(String(newFact.id))}`;
  const checkpointResult = await client.send(new GetItemCommand({ TableName: rollupTable, Key: { id: attribute(checkpointId) }, ConsistentRead: true }));
  const checkpoint = record(checkpointResult.Item);
  if (checkpoint?.lastSequence >= sequence) return;

  const deltas = new Map();
  if (checkpoint?.snapshot) mergeContributions(deltas, createContributions(JSON.parse(checkpoint.snapshot)), -1);
  mergeContributions(deltas, createContributions(newFact), 1);
  const transactItems = Array.from(deltas.values())
    .filter((row) => row.count || row.deviationSum || row.deviationSquares)
    .map(rollupUpdate);
  transactItems.push({
    Put: {
      TableName: rollupTable,
      Item: {
        id: attribute(checkpointId),
        lastSequence: attribute(sequence),
        snapshot: attribute(JSON.stringify(newFact)),
      },
      ConditionExpression: 'attribute_not_exists(id) OR lastSequence < :sequence',
      ExpressionAttributeValues: { ':sequence': attribute(sequence) },
    },
  });

  try {
    await client.send(new TransactWriteItemsCommand({ TransactItems: transactItems }));
  } catch (error) {
    if (error.name === 'TransactionCanceledException') {
      const latestResult = await client.send(new GetItemCommand({ TableName: rollupTable, Key: { id: attribute(checkpointId) }, ConsistentRead: true }));
      if (record(latestResult.Item)?.lastSequence >= sequence) return;
    }
    throw error;
  }
}

exports.handler = async (event) => {
  const batchItemFailures = [];
  for (const streamRecord of event.Records || []) {
    try {
      await processRecord(streamRecord);
    } catch (error) {
      console.error('National annual CBE rollup failed', streamRecord.eventID, error);
      batchItemFailures.push({ itemIdentifier: streamRecord.dynamodb?.SequenceNumber });
    }
  }
  return { batchItemFailures };
};

exports.__test = { createContributions, deviationBin, mergeContributions, processRecord };
