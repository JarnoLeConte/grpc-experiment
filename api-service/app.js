const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const { callbackifyAll } = require('../lib/helpers');

const protoFile = '../protos/api.proto';

const protoOptions = {
  keepCase: false,
  longs: String,
  enums: Number,
  defaults: false,
  oneofs: false,
  arrays: true,
};

const packageDefinition = protoLoader.loadSync(protoFile, protoOptions);
const { Api } = grpc.loadPackageDefinition(packageDefinition).api;


const consumers = [];
const locations = [];


const server = new grpc.Server();

const Consumer = {
  async createConsumer({ request: { consumer } }) {
    console.log('create', consumer);
    const id = Math.max(0, ...consumers.map(c => c.id)) + 1;
    consumers.push({ ...consumer, id });
    return { result: { id } };
  },
  async readConsumer({ request: { id } }) {
    console.log('read', id);
    const consumer = consumers.find(c => c.id === id);
    if (!consumer) return { error: 'ERROR_NOT_FOUND' }; // Error if not found
    return { result: { consumer } };
  },
  async updateConsumer({ request: { consumer } }) {
    console.log('update', consumer);
    const current = consumers.find(c => c.id === consumer.id) || {};
    Object.assign(current, consumer);
    return { result: {} };
  },
  async deleteConsumer({ request: { id } }) {
    console.log('delete', id);
    const index = consumers.findIndex(c => c.id === id);
    if (index !== -1) consumers.splice(index, 1);
    return { result: {} };
  },
  async listConsumer({ request }) {
    console.log('list', request);
    return { result: { consumers } };
  },
};

const Location = {
  async createLocation({ request: { location } }) {
    console.log('create', location);
    const id = Math.max(0, ...locations.map(c => c.id)) + 1;
    locations.push({ ...location, id });
    return { result: { id } };
  },
  async readLocation({ request: { id } }) {
    console.log('read', id);
    const location = locations.find(c => c.id === id);
    if (!location) return { error: 'ERROR_NOT_FOUND' }; // Error if not found
    return { result: { location } };
  },
  async updateLocation({ request: { location } }) {
    console.log('update', location);
    const current = locations.find(c => c.id === location.id) || {};
    Object.assign(current, location);
    return { result: {} };
  },
  async deleteLocation({ request: { id } }) {
    console.log('delete', id);
    const index = locations.findIndex(c => c.id === id);
    if (index !== -1) locations.splice(index, 1);
    return { result: {} };
  },
  async listLocation({ request }) {
    console.log('list', request);
    return { result: { locations } };
  },
};

server.addService(Api.service, callbackifyAll({
  ...Consumer,
  ...Location,
}));

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();
