import natural from 'natural';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const MODEL_PATH = path.join(DATA_DIR, 'spamClassifier.json');
const TRAINING_PATH = path.join(DATA_DIR, 'spamTrainingData.json');

let classifier = null;
let isTrained = false;

function resetClassifier() {
  classifier = null;
  isTrained = false;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadExistingModel() {
  ensureDataDir();
  if (!fs.existsSync(MODEL_PATH)) return;

  try {
    const raw = fs.readFileSync(MODEL_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    classifier = natural.BayesClassifier.restore(parsed);
    isTrained = true;
  } catch (err) {
    console.error('Failed to load spam classifier model:', err);
    resetClassifier();
  }
}

function loadTrainingData() {
  ensureDataDir();
  if (fs.existsSync(TRAINING_PATH)) {
    try {
      const raw = fs.readFileSync(TRAINING_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (err) {
      console.error('Failed to read spam training data:', err);
    }
  }

  const seed = [
    { text: 'food food food food food', label: 'spam' },
    { text: 'lorem ipsum dolor sit amet', label: 'spam' },
    { text: 'sample complaint please ignore', label: 'spam' },
    { text: 'test complaint testing only', label: 'spam' },
    { text: 'sports sports sports sports', label: 'spam' },
    { text: 'sports food sports food random words', label: 'spam' },
    { text: 'bench in lecture theatre is broken and sparks when touched', label: 'valid' },
    { text: 'food in canteen has insects and smells spoiled', label: 'valid' },
    { text: 'wifi in hostel not working since morning', label: 'valid' },
    { text: 'loud noise from generator disturbing classes', label: 'valid' },
    { text: 'water leakage near dorm room 204', label: 'valid' },
    { text: 'printer in lab jammed papers all day', label: 'valid' },
  ];

  try {
    fs.writeFileSync(TRAINING_PATH, JSON.stringify(seed, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write default training data:', err);
  }
  return seed;
}

function trainIfNeeded() {
  if (classifier && isTrained) return classifier;

  loadExistingModel();
  if (classifier && isTrained) return classifier;

  const data = loadTrainingData();
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('Spam classifier training data is empty.');
    resetClassifier();
    return null;
  }

  classifier = new natural.BayesClassifier();
  for (const item of data) {
    if (!item?.text || !item?.label) continue;
    classifier.addDocument(item.text.toLowerCase(), item.label);
  }

  classifier.train();
  isTrained = true;

  try {
    ensureDataDir();
    fs.writeFileSync(MODEL_PATH, JSON.stringify(classifier), 'utf8');
  } catch (err) {
    console.error('Failed to persist spam classifier model:', err);
  }

  return classifier;
}

function isNotTrainedError(error) {
  if (!error) return false;
  const message = typeof error === 'string' ? error : error.message || '';
  return message.toLowerCase().includes('not trained');
}

function classifySpam(text, attempt = 0) {
  try {
    const model = trainIfNeeded();
    if (!model || !isTrained) return false;

    if (!text.trim()) return true;

    const tokens = text.match(/\b\w+\b/g) || [];
    const tokenCount = tokens.length;

    const label = model.classify(text);
    if (label === 'spam') {
      const scores = model.getClassifications(text);
      const spamScore = scores.find((s) => s.label === 'spam')?.value ?? 0;
      const validScore = scores.find((s) => s.label === 'valid')?.value ?? 0;
      const totalScore = spamScore + validScore || 1;
      const spamProbability = spamScore / totalScore;

      // If the model isn't strongly confident, treat long, detailed text as valid.
      if (tokenCount >= 8 && spamProbability < 0.75) {
        return false;
      }
      if (spamScore < 0.8 && spamProbability < 0.65) {
        return false;
      }
      return true;
    }

    const scores = model.getClassifications(text);
    const spamScore = scores.find((s) => s.label === 'spam')?.value ?? 0;
    const validScore = scores.find((s) => s.label === 'valid')?.value ?? 0;
    const totalScore = spamScore + validScore || 1;
    const spamProbability = spamScore / totalScore;
    return spamScore > validScore && spamProbability >= 0.7 && spamScore >= 0.6;
  } catch (err) {
    if (isNotTrainedError(err) && attempt === 0) {
      console.warn('Spam classifier reported "Not Trained". Reinitialising…');
      resetClassifier();
      return classifySpam(text, attempt + 1);
    }
    console.error('Spam classifier error:', err);
    resetClassifier();
    return false;
  }
}

export function isSpamText(title, body) {
  const text = `${title || ''} ${body || ''}`.toLowerCase();
  return classifySpam(text);
}

export function addTrainingExample(text, isSpam) {
  const entry = { text, label: isSpam ? 'spam' : 'valid' };
  const existing = loadTrainingData();
  const updated = Array.isArray(existing) ? [...existing, entry] : [entry];

  try {
    fs.writeFileSync(TRAINING_PATH, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to append training data:', err);
  }

  resetClassifier();
  trainIfNeeded();
}


