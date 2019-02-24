const grpc = require('grpc');
const protos = require('@jarnoleconte/grpc-experiment-protos');
const { callbackifyAll } = require('../lib/helpers');

const packageDefinition = protos.loadSync('api.proto');
const { Api } = grpc.loadPackageDefinition(packageDefinition).api;


// In memory storage for demo purpose
const consumers = [];
const locations = [];


/* Simple CRUD operations */

const Consumer = callbackifyAll({
  async createConsumer({ request: { consumer } }) {
    const id = Math.max(0, ...consumers.map(c => c.id)) + 1;
    consumers.push({ ...consumer, id });
    return { result: { id } };
  },
  async readConsumer({ request: { id } }) {
    const consumer = consumers.find(c => c.id === id);
    if (!consumer) return { error: 'ERROR_NOT_FOUND' }; // Error if not found
    return { result: { consumer } };
  },
  async updateConsumer({ request: { consumer } }) {
    const current = consumers.find(c => c.id === consumer.id) || {};
    Object.assign(current, consumer);
    return { result: {} };
  },
  async deleteConsumer({ request: { id } }) {
    const index = consumers.findIndex(c => c.id === id);
    if (index !== -1) consumers.splice(index, 1);
    return { result: {} };
  },
  async listConsumer() {
    return { result: { consumers } };
  },
});

const Location = callbackifyAll({
  async createLocation({ request: { location } }) {
    const id = Math.max(0, ...locations.map(c => c.id)) + 1;
    locations.push({ ...location, id });
    return { result: { id } };
  },
  async readLocation({ request: { id } }) {
    const location = locations.find(c => c.id === id);
    if (!location) return { error: 'ERROR_NOT_FOUND' }; // Error if not found
    return { result: { location } };
  },
  async updateLocation({ request: { location } }) {
    const current = locations.find(c => c.id === location.id) || {};
    Object.assign(current, location);
    return { result: {} };
  },
  async deleteLocation({ request: { id } }) {
    const index = locations.findIndex(c => c.id === id);
    if (index !== -1) locations.splice(index, 1);
    return { result: {} };
  },
  async listLocation() {
    return { result: { locations } };
  },
});

// Non-promisified function
Location.reshapeLocation = (call) => {
  call.on('data', (data) => {
    call.write({
      x: (data.width / 360) * (180 + data.lon),
      y: (data.height / 180) * (90 - data.lat),
    });
  });
  call.on('end', call.end);
};


/* Setup gRPC server */

const server = new grpc.Server();

server.addService(Api.service, {
  ...Consumer,
  ...Location,
});

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();
