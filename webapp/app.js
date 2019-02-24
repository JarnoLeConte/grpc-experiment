const promisifyAll = require('util-promisifyall');
const grpc = require('grpc');
const protos = require('@jarnoleconte/grpc-experiment-protos');

const packageDefinition = protos.loadSync('api.proto');
const { Api } = grpc.loadPackageDefinition(packageDefinition).api;

const api = new Api('localhost:50051', grpc.credentials.createInsecure());
promisifyAll(api);


function log(response) {
  if (response.error) {
    switch (response.error) {
      case 'ERROR_ACTION_FAILED': console.log('Error', 'Action Failed'); break;
      case 'ERROR_NOT_FOUND': console.log('Error', 'Not Found'); break;
      default: break;
    }
  } else {
    console.log('Result', response.result);
  }
}

async function demo() {
  console.log('Manage consumers...');
  await api.createConsumerAsync({ consumer: { name: 'Jan', type: 'COMPANY' } }).then(log);
  await api.listConsumerAsync({}).then(log);
  await api.createConsumerAsync({ consumer: { name: 'Klaas' } }).then(log);
  await api.listConsumerAsync({}).then(log);
  await api.readConsumerAsync({ id: 2 }).then(log);
  await api.readConsumerAsync({ id: 20 }).then(log); // Not Exist
  await api.updateConsumerAsync({ consumer: { id: 2, name: 'Piet' } }).then(log);
  await api.readConsumerAsync({ id: 2 }).then(log);
  await api.deleteConsumerAsync({ id: 2 }).then(log);
  await api.listConsumerAsync({}).then(log);

  console.log('Manage locations...');
  await api.createLocationAsync({ location: { lat: 5.0, lon: 32.0 } }).then(log);
  await api.listLocationAsync({}).then(log);
  await api.createLocationAsync({ location: { lat: 7.0 } }).then(log);
  await api.listLocationAsync({}).then(log);
  await api.readLocationAsync({ id: 2 }).then(log);
  await api.readLocationAsync({ id: 20 }).then(log); // Not Exist
  await api.updateLocationAsync({ location: { id: 2, lon: 7.0 } }).then(log);
  await api.readLocationAsync({ id: 2 }).then(log);
  await api.deleteLocationAsync({ id: 2 }).then(log);
  await api.listLocationAsync({}).then(log);

  console.log('Reshaping locations to fit on image; process as stream...');
  const call = api.reshapeLocation();
  call.on('data', (result) => {
    console.log('result', result);
  });
  call.on('end', () => {
    console.log('done');
  });
  let i = 0;
  for (; i < 30000; i += 1) {
    call.write({
      width: 720,
      height: 360,
      lat: Math.random() * 180 - 90,
      lon: Math.random() * 360 - 180,
    });
  }
}

demo()
  .then(() => console.log('success'))
  .catch(err => console.error(err));
