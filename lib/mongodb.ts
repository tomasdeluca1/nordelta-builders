import { MongoClient, ServerApiVersion } from 'mongodb';

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  return uri;
}

function createClient(): MongoClient {
  return new MongoClient(getMongoUri(), {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClient?: MongoClient;
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClient = createClient();
      globalWithMongo._mongoClientPromise = globalWithMongo._mongoClient.connect();
    }

    return globalWithMongo._mongoClientPromise;
  }

  if (!clientPromise) {
    client = createClient();
    clientPromise = client.connect();
  }

  return clientPromise;
}
