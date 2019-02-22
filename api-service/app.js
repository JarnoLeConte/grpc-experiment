const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const protoFile = '../protos/api.proto';

const packageDefinition = protoLoader.loadSync(protoFile);
const { API } = grpc.loadPackageDefinition(packageDefinition).api;


const consumers = [];

function getConsumers(call, callback) {
  callback(null, { result: consumers });
}

function getConsumer(call, callback) {
  const consumer = consumers.find(c => c.id === call.request.id);
  callback(null, { result: consumer });
}

function updateConsumer(call, callback) {
  const consumer = consumers.find(c => c.id === call.request.id) || {};
  Object.assign(consumer, call.request);
  callback(null, { result: consumer });
}

function createConsumer(call, callback) {
  const id = Math.max(0, ...consumers.map(c => c.id)) + 1;
  const consumer = { id, ...call.request };
  consumers.push(consumer);
  callback(null, { result: consumer });
}

function removeConsumer(call, callback) {
  const index = consumers.findIndex(c => c.id === call.request.id);
  if (index !== -1) consumers.splice(index, 1);
  callback(null, {});
}


const server = new grpc.Server();

server.addService(API.service, {
  getConsumers,
  getConsumer,
  updateConsumer,
  createConsumer,
  removeConsumer,
});

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();
