import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'data_entry_portal';

let client;
let clientPromise;

if (MONGODB_URI) {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

const dbPath = path.resolve(process.cwd(), 'database.json');
const schemasPath = path.resolve(process.cwd(), 'src/lib/schemas.json');
const branchesPath = path.resolve(process.cwd(), 'src/lib/branches.json');

const initDb = () => {
  if (!MONGODB_URI) {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({ aml_training: [], induction_program: [] }));
    }
    if (!fs.existsSync(schemasPath)) {
      fs.writeFileSync(schemasPath, JSON.stringify([]));
    }
  }
};

const getLocalDb = () => {
    initDb();
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
};

const saveLocalDb = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Generic insert
export const insertData = async (collectionName, data) => {
  if (MONGODB_URI) {
    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    data.createdAt = new Date().toISOString();
    const res = await db.collection(collectionName).insertOne(data);
    return res.insertedId;
  } else {
    const db = getLocalDb();
    data.id = Date.now();
    data.createdAt = new Date().toISOString();
    if (!db[collectionName]) db[collectionName] = [];
    db[collectionName].push(data);
    saveLocalDb(db);
    return data.id;
  }
};

// Generic fetch
export const getData = async (collectionName) => {
  if (MONGODB_URI) {
    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    return await db.collection(collectionName).find({}).sort({ _id: -1 }).toArray();
  } else {
    const db = getLocalDb();
    return (db[collectionName] || []).sort((a,b) => b.id - a.id);
  }
};

// Specialized methods for backward compatibility
export const insertAmlTraining = (data) => insertData('aml_training', data);
export const insertInductionProgram = (data) => insertData('induction_program', data);
export const geAmlTraining = () => getData('aml_training');
export const getInductionProgram = () => getData('induction_program');
export const insertDynamicData = (schemaId, data) => insertData(schemaId, data);
export const getDynamicData = (schemaId) => getData(schemaId);

// Schema management
export const getSchemas = async () => {
    if (MONGODB_URI) {
        const client = await clientPromise;
        const db = client.db(MONGODB_DB);
        return await db.collection('schemas').find({}).toArray();
    } else {
        if (!fs.existsSync(schemasPath)) return [];
        return JSON.parse(fs.readFileSync(schemasPath, 'utf8'));
    }
};

export const saveSchema = async (schema) => {
    if (MONGODB_URI) {
        const client = await clientPromise;
        const db = client.db(MONGODB_DB);
        await db.collection('schemas').replaceOne({ id: schema.id }, schema, { upsert: true });
    } else {
        let schemas = await getSchemas();
        schemas = schemas.filter(s => s.id !== schema.id);
        schemas.push(schema);
        fs.writeFileSync(schemasPath, JSON.stringify(schemas, null, 2));
    }
};

// Branch management
export const getBranches = async () => {
    if (MONGODB_URI) {
        const client = await clientPromise;
        const db = client.db(MONGODB_DB);
        const branchesArr = await db.collection('branches').find({}).toArray();
        const branchesObj = {};
        branchesArr.forEach(b => {
            const { code, ...rest } = b;
            branchesObj[code] = rest;
        });
        return branchesObj;
    } else {
        if (!fs.existsSync(branchesPath)) return {};
        return JSON.parse(fs.readFileSync(branchesPath, 'utf8'));
    }
};

export const updateBranch = async (code, branchData) => {
    if (MONGODB_URI) {
        const client = await clientPromise;
        const db = client.db(MONGODB_DB);
        await db.collection('branches').replaceOne({ code }, { code, ...branchData }, { upsert: true });
    } else {
        const branches = await getBranches();
        branches[code] = branchData;
        fs.writeFileSync(branchesPath, JSON.stringify(branches, null, 2));
    }
};

initDb();

