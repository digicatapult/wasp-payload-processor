const BYTE_PAYLOAD = (messageTimestamp) => ({
  message: {
    key: '00000000-0000-0000-0000-000000000000',
    value: JSON.stringify({
      thingId: '00000000-0000-0000-0000-000000000000',
      type: 'test-sensor',
      ingest: 'ttn-v2',
      ingestId: '4883C7DF300514ED',
      timestamp: messageTimestamp,
      payload: Buffer.from('00010203040506070809', 'hex').toString('base64'),
      metadata: {},
    }),
  },
  expectedReadings: [
    {
      dataset: {
        label: 'index-0',
        thingId: '00000000-0000-0000-0000-000000000000',
        type: 'byte',
        unit: 'B',
      },
      timestamp: messageTimestamp,
      value: 0,
    },
    {
      dataset: {
        label: 'index-1',
        thingId: '00000000-0000-0000-0000-000000000000',
        type: 'byte',
        unit: 'B',
      },
      timestamp: messageTimestamp,
      value: 1,
    },
    {
      dataset: {
        label: 'index-2',
        thingId: '00000000-0000-0000-0000-000000000000',
        type: 'byte',
        unit: 'B',
      },
      timestamp: messageTimestamp,
      value: 2,
    },
    {
      dataset: {
        label: 'index-3',
        thingId: '00000000-0000-0000-0000-000000000000',
        type: 'byte',
        unit: 'B',
      },
      timestamp: messageTimestamp,
      value: 3,
    },
    {
      dataset: {
        label: 'index-4',
        thingId: '00000000-0000-0000-0000-000000000000',
        type: 'byte',
        unit: 'B',
      },
      timestamp: messageTimestamp,
      value: 4,
    },
    {
      dataset: {
        label: 'index-5',
        thingId: '00000000-0000-0000-0000-000000000000',
        type: 'byte',
        unit: 'B',
      },
      timestamp: messageTimestamp,
      value: 5,
    },
    {
      dataset: {
        label: 'index-6',
        thingId: '00000000-0000-0000-0000-000000000000',
        type: 'byte',
        unit: 'B',
      },
      timestamp: messageTimestamp,
      value: 6,
    },
    {
      dataset: {
        label: 'index-7',
        thingId: '00000000-0000-0000-0000-000000000000',
        type: 'byte',
        unit: 'B',
      },
      timestamp: messageTimestamp,
      value: 7,
    },
    {
      dataset: {
        label: 'index-8',
        thingId: '00000000-0000-0000-0000-000000000000',
        type: 'byte',
        unit: 'B',
      },
      timestamp: messageTimestamp,
      value: 8,
    },
    {
      dataset: {
        label: 'index-9',
        thingId: '00000000-0000-0000-0000-000000000000',
        type: 'byte',
        unit: 'B',
      },
      timestamp: messageTimestamp,
      value: 9,
    },
  ],
  expectedEvents: [
    {
      thingId: '00000000-0000-0000-0000-000000000000',
      timestamp: messageTimestamp,
      type: 'TEST_EVENT_1',
      details: { name: 'First' },
    },
    {
      thingId: '00000000-0000-0000-0000-000000000000',
      timestamp: messageTimestamp,
      type: 'TEST_EVENT_2',
      details: { name: 'Second' },
    },
  ],
})

const EMPTY_PAYLOAD = (messageTimestamp) => ({
  message: {
    key: '00000000-0000-0000-0000-000000000000',
    value: JSON.stringify({
      thingId: '00000000-0000-0000-0000-000000000000',
      type: 'test-sensor',
      ingest: 'ttn-v2',
      ingestId: '4883C7DF300514ED',
      timestamp: messageTimestamp,
      payload: Buffer.from('', 'hex').toString('base64'),
      metadata: {},
    }),
  },
  expectedReadings: [],
  expectedEvents: [],
})

const INVALID_PAYLOAD = (messageTimestamp) => ({
  message: {
    key: '00000000-0000-0000-0000-000000000000',
    value: JSON.stringify({
      thingId: '00000000-0000-0000-0000-000000000000',
      type: 'test-sensor',
      ingest: 'ttn-v2',
      ingestId: '4883C7DF300514ED',
      timestamp: messageTimestamp,
      payload: 'invalid',
      metadata: {},
    }),
  },
  expectedReadings: [],
  expectedEvents: [],
})

export { BYTE_PAYLOAD, EMPTY_PAYLOAD, INVALID_PAYLOAD }
