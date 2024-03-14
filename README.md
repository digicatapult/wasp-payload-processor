# wasp-payload-processor

## Deprecation Notice
`WASP` was deprecated on March 14th 2024, there will be no further dependency or security updates to this platform.
---

Service builder for WASP payload processors. The library provides a simple way of implementing a payload processor for a new thing type in WASP. The intentions of this module is to simplify the development of support for new IoT devices in WASP.

## Developing a new WASP payload processor

If developing a new payload parsing service for WASP this could be as simple as:

```js
// server.js

import { buildService } from '@digicatapult/wasp-payload-processor'

buildService({
    sensorType: 'new-sensor-type',
    payloadProcessor: ({ logger }) => ({ thingId, timestamp, payload }) => {
    const asBuffer = Buffer.from(payload, 'base64')
    return {
      readings: [{
        dataset: {
          thingId,
          type: 'temperature',
          label: 'dataset-label-if-any',
          unit: '°C',
        },
        timestamp,
        value: asBuffer[0],
      }]),
      events: [{
        thingId,
        timestamp,
        type: 'SHOCK',
        details: { arbitrary: "details" }
      }]
  },
})
```

The format of the outgoing message format is described below

## Message format

The `payloadProcessor` function must return an object of type `PayloadProcessorResult` which contains descriptions of readings and events to be published. The type signatures are as follows:

```ts
type Event = {
  thingId: uuid
  type: string
  timestamp: string
  details: Object
}

type Dataset = {
  thingId: uuid
  type: string
  label: string
  unit: string
}

type DatasetPoint = {
  dataset: Dataset
  timestamp: string
  value: number
}

type PayloadProcessorResult = {
  readings: DatasetPoint[]
  events: Event[]
}
```

Each of the `DatasetPoint` values represents a single value at a point in time for the dataset defined by the `thingId`, `type`, `label` and `unit`. Here the `thingId` is the uuid of the IoT device that generated the reading, `type` is the type of the dataset e.g. `temperature` and `label` is an arbitrary `label` to distinguish datasets when a thing may generate multiple datasets of the same type e.g. MCU temperature vs external temperature.

Each of the `Event` values represents an event reported by a `thingId`, which is then characterised by an event `type` and a `timestamp` at which the event occurred. An arbitrary `details` property allows the event to convey additional information about the event.

## Testing

First install required dependencies using `npm`:

```sh
npm install
```

`wasp-payload-processor` depends on `Kafka` which can be brought up locally using docker:

```sh
docker-compose up -d
```

And finally you can run tests with:

```sh
npm test
```

## Environment Variables

`wasp-payload-processor` is configured primarily using environment variables as follows:

| variable                    | required |     default     | description                                                                             |
| :-------------------------- | :------: | :-------------: | :-------------------------------------------------------------------------------------- |
| PORT                        |    N     |      `3000`     | Port on which the service will listen                                                   |
| LOG_LEVEL                   |    N     |      `info`     | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`]    |
| KAFKA_LOG_LEVEL             |    N     |    `nothing`    | Logging level for Kafka. Valid values are [`debug`, `info`, `warn`, `error`, `nothing`] |
| KAFKA_BROKERS               |    N     | `localhost:9092`| List of addresses for the Kafka brokers                                                 |
| KAFKA_READINGS_TOPIC        |    N     |   `readings`    | Outgoing Kafka topic for readings                                                       |
| KAFKA_EVENTS_TOPIC          |    N     |    `events`     | Outgoing Kafka topic for events                                                         |
| KAFKA_PAYLOAD_ROUTING_PREFIX|    N     |   `payloads`    | Prefix for incoming Kafka topics for payloads                                           |
