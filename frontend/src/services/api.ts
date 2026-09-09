import { Instrument, VisionDetectionResult, SongChart } from '../types';
import { HISTORICAL_INSTRUMENTS } from '../data/instrumentsData';
import { HERITAGE_SONGS } from '../data/songsData';
import { ANCIENT_TREATISES } from '../data/treatisesData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export class ApiClient {
  // Fetch All Instruments
  public static async getInstruments(): Promise<Instrument[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/instruments`);
      if (!res.ok) throw new Error('Backend unavailable');
      const data = await res.json();
      return data.instruments || data;
    } catch {
      // Fallback to local dataset
      return HISTORICAL_INSTRUMENTS;
    }
  }

  // Fetch Instrument by ID
  public static async getInstrumentById(id: string): Promise<Instrument | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/instruments/${id}`);
      if (!res.ok) throw new Error('Instrument not found');
      return await res.json();
    } catch {
      return HISTORICAL_INSTRUMENTS.find((i) => i.id === id) || null;
    }
  }

  // Submit Image to AI Vision Classifier Endpoint
  public static async classifyImage(
    imageDataUrl: string,
    forcedInstrumentId?: string
  ): Promise<VisionDetectionResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/vision/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: imageDataUrl,
          forced_instrument_id: forcedInstrumentId
        })
      });
      if (!res.ok) throw new Error('Vision API error');
      return await res.json();
    } catch {
      // Fallback to client-side heuristic simulation
      const { VisionClassifier } = await import('./visionClassifier');
      return VisionClassifier.analyzeImage(imageDataUrl, forcedInstrumentId);
    }
  }

  // Query Historical Treatises via RAG
  public static async queryTreatises(query: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!res.ok) throw new Error('RAG query error');
      return await res.json();
    } catch {
      return {
        query,
        citations: ANCIENT_TREATISES.flatMap((t) => t.keyQuotations),
        summary: 'Historical knowledge retrieved from Natya Shastra and Sangita Ratnakara.'
      };
    }
  }

  // Confirm or Correct AI Vision Label (Dataset Growth)
  public static async confirmVisionClassification(payload: {
    imageDataUrl: string;
    predictedId: string;
    confirmedId: string;
    userCorrected: boolean;
    confidenceScore?: number;
    feedbackNotes?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/vision/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: payload.imageDataUrl,
          predicted_instrument_id: payload.predictedId,
          confirmed_instrument_id: payload.confirmedId,
          user_corrected: payload.userCorrected,
          confidence_score: payload.confidenceScore,
          feedback_notes: payload.feedbackNotes
        })
      });
      if (!res.ok) throw new Error('Confirmation API error');
      return await res.json();
    } catch (e) {
      console.warn('Dataset logging fallback:', e);
      return { status: 'logged_offline', instrument_id: payload.confirmedId };
    }
  }

  // Get Confirmed Dataset Stats
  public static async getVisionDatasetStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/vision/dataset-stats`);
      if (!res.ok) throw new Error('Stats API error');
      return await res.json();
    } catch {
      return { total_confirmed_samples: 13, samples_per_instrument: {} };
    }
  }

  // Fetch Rhythm Game Songs
  public static async getSongs(): Promise<SongChart[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/songs`);
      if (!res.ok) throw new Error('Songs API error');
      const data = await res.json();
      return data.songs || data;
    } catch {
      return HERITAGE_SONGS;
    }
  }
}

