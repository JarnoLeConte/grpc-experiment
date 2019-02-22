const bluebird = require('bluebird');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const protoFile = '../protos/api.proto';

const packageDefinition = protoLoader.loadSync(protoFile);
const { API } = grpc.loadPackageDefinition(packageDefinition).api;


const api = new API('localhost:50051', grpc.credentials.createInsecure());

bluebird.promisifyAll(api);


async function demo() {
  console.log(await api.createConsumerAsync({ name: 'Jan' }));
  console.log(await api.getConsumersAsync({}));
  console.log(await api.createConsumerAsync({ name: 'Klaas' }));
  console.log(await api.getConsumersAsync({}));
  console.log(await api.getConsumerAsync({ id: 2 }));
  console.log(await api.updateConsumerAsync({ id: 2, name: 'Piet' }));
  console.log(await api.getConsumerAsync({ id: 2 }));
  console.log(await api.removeConsumerAsync({ id: 2 }));
  console.log(await api.getConsumersAsync({}));
}

demo();
