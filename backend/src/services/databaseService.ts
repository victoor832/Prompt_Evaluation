import { MongoClient, Collection, Db, Document } from 'mongodb';
import { EvaluationResponse } from '../types';
import dotenv from 'dotenv';
dotenv.config();

export class DatabaseService {
  private static instance: DatabaseService;
  private client: MongoClient;
  private db: Db | null = null;
  private connected: boolean = false;
  private connecting: boolean = false;


  constructor() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está configurada en variables de entorno');
    }

    this.client = new MongoClient(mongoUri, {
      // Estas opciones son importantes para producción
      maxPoolSize: 10,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });
  }

  // Patrón Singleton para evitar múltiples conexiones
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connecting) return;

    try {
      this.connecting = true;
      await this.client.connect();
      this.db = this.client.db('ai-assessment');
      this.connected = true;
      this.connecting = false;
      console.log('✅ Conectado a MongoDB Atlas correctamente');
    } catch (error) {
      this.connecting = false;
      console.error('❌ Error al conectar a MongoDB:', error);
      throw error;
    }
  }

  private getCollection<T extends Document>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('La conexión a la base de datos no está establecida');
    }
    return this.db.collection<T>(name);
  }

  public async saveEvaluation(evaluation: EvaluationResponse, challengeId: string = 'custom'): Promise<string> {
    try {
      if (!this.connected) {
        await this.connect();
      }

      const collection = this.getCollection<any>('evaluations');
      
      const evalToSave = {
        ...evaluation,
        challengeId,
        createdAt: new Date(),
        // Convertir a estructura adecuada para MongoDB
        evaluation: typeof evaluation.evaluation === 'string' 
          ? { rawResponse: evaluation.evaluation } 
          : evaluation.evaluation
      };

      const result = await collection.insertOne(evalToSave);
      console.log(`✅ Evaluación guardada en MongoDB con ID: ${result.insertedId}`);
      return result.insertedId.toString();
    } catch (error) {
      console.error('❌ Error al guardar evaluación en MongoDB:', error);
      throw error;
    }
  }

  public async getAllEvaluations(limit: number = 100): Promise<any[]> {
    try {
      if (!this.connected) {
        await this.connect();
      }

      const collection = this.getCollection<any>('evaluations');
      return await collection.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('❌ Error al obtener evaluaciones:', error);
      throw error;
    }
  }

  public async getEvaluationsByUser(userId: string): Promise<any[]> {
    try {
      if (!this.connected) {
        await this.connect();
      }

      const collection = this.getCollection<any>('evaluations');
      return await collection.find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      console.error(`❌ Error al obtener evaluaciones del usuario ${userId}:`, error);
      throw error;
    }
  }
}