import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { isSpamText } from '../services/spamClassifier.js';
import { classifyComplaintText } from '../services/routingClassifier.js';

const execFileAsync = promisify(execFile);
let pythonCommandPromise = null;

async function resolvePythonCommand() {
  if (pythonCommandPromise) {
    return pythonCommandPromise;
  }

  const candidates =
    process.platform === 'win32'
      ? ['python', 'py', 'python3']
      : ['python3', 'python'];

  pythonCommandPromise = (async () => {
    for (const cmd of candidates) {
      try {
        await execFileAsync(cmd, ['--version']);
        console.log(`[AI Routing] Using Python command: ${cmd}`);
        return cmd;
      } catch (error) {
        if (error?.code !== 'ENOENT') {
          console.warn(`[AI Routing] Failed to run "${cmd} --version":`, error?.message || error);
        }
      }
    }
    throw new Error(
      `No Python executable found. Tried: ${candidates.join(', ')}. ` +
        'Install Python or set PYTHON path.'
    );
  })();

  return pythonCommandPromise;
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CATEGORY_RULES = {
  'Admin': [
    // Explicit Admin bucket so code can route directly to Admin when needed
    'admin', 'general', 'management', 'general complaint', 'administration', 'office'
  ],
  'Hostel Management': [
    'water', 'electric', 'electricity', 'maintenance', 'repair', 'clean', 'washroom',
    'bathroom', 'sink', 'room', 'leak', 'drain', 'clog', 'clogging', 'warden', 'hostel',
    'residence', 'dorm', 'ceiling', 'fan', 'lift', 'elevator', 'plumbing', 'sewage', 'floor'
  ],
  'Cafeteria': [
    'food', 'canteen', 'mess', 'meal', 'dining', 'hygiene', 'kitchen', 'cafeteria',
    'snack', 'lunch', 'dinner', 'cook', 'insect', 'worm', 'spoiled', 'stale', 'contamination'
  ],
  'Tech-Support': [
    'login', 'portal', 'wifi', 'internet', 'printer', 'server', 'software', 'website',
    'network', 'system', 'computer', 'projector', 'speaker', 'audio', 'microphone',
    'screen', 'smartboard', 'technical', 'app', 'digital', 'it support'
  ],
  'Sports': [
    'ground', 'stadium', 'equipment', 'tournament', 'coach', 'sports', 'practice',
    'gym', 'fitness', 'playground', 'game'
  ],
  'Academic': [
    'exam', 'lecture', 'faculty', 'course', 'attendance', 'assignment', 'grade',
    'marks', 'timetable', 'syllabus', 'class', 'professor', 'teacher', 'seminar',
    'tutorial', 'workshop', 'laboratory', 'lab session'
  ],
  'Internal Complaints': [
    'harassment', 'ragging', 'bullying', 'assault', 'discrimination', 'misconduct',
    'abuse', 'violence', 'threat', 'safety incident'
  ],
  'Annual Fest': [
    'event', 'fest', 'annual', 'volunteer', 'sponsor', 'celebration', 'gala',
    'festival', 'show', 'stage'
  ],
  'Cultural': [
    'dance', 'music', 'drama', 'club', 'competition', 'cultural', 'performance',
    'arts', 'theatre'
  ],
  'Student Placement': [
    'internship', 'placement', 'company', 'drive', 'resume', 'job', 'offer', 'recruiter',
    'career', 'interview', 'aptitude'
  ]
};

const PRIORITY_RULES = {
  'High': [
    'water', 'electricity', 'electrocute', 'fire', 'gas', 'medical', 'harassment',
    'assault', 'ragging', 'emergency', 'injury', 'accident', 'collapse', 'poison',
    'spoiled food', 'contaminated', 'insect', 'worm', 'unsafe', 'security', 'short circuit',
    'leak', 'flood', 'broken glass', 'violence'
  ],
  'Medium': [
    'wifi', 'printer', 'assignment', 'grades', 'cleaning', 'software', 'portal',
    'login', 'speaker', 'audio', 'projector', 'equipment not working', 'network',
    'maintenance', 'air conditioning', 'lighting'
  ],
  'Low': [
    'event', 'cultural', 'sports', 'festival', 'mess', 'schedule change', 'noise',
    'crowd', 'minor'
  ]
};

const ALLOWED_COMMITTEES = Object.keys(CATEGORY_RULES);
const ALLOWED_PRIORITIES = ['High', 'Medium', 'Low'];

const SPAM_PHRASES = [
  'sample complaint', 'test complaint', 'dummy complaint', 'ignore this', 'testing only',
  'just to mess', 'lorem ipsum'
];

const ENGLISH_WORDS = new Set([
  'the','be','to','of','and','a','in','that','have','it','for','not','on','with','as',
  'you','do','this','but','his','by','from','they','we','say','her','she','or','an',
  'will','my','one','all','would','there','their','what','so','up','out','if','about',
  'who','get','which','go','me','when','make','can','like','time','no','just','him',
  'know','take','people','into','year','your','good','some','could','them','see',
  'other','than','then','now','look','only','come','its','over','think','also','back',
  'after','use','two','how','our','work','first','well','way','even','new','want',
  'because','any','these','give','day','most','us','student','staff','teacher',
  'class','classroom','lecture','problem','issue','repair','broken','crowded','queue',
  'dirty','clean','messy','mess','canteen','food','meal','dining','snack','drink',
  'water','washroom','toilet','restroom','bathroom','hostel','room','bed','door',
  'window','electric','electricity','power','light','fan','ac','air','conditioner',
  'projector','screen','speaker','microphone','wifi','network','internet','computer',
  'laptop','system','printer','server','lab','laboratory','ground','sports','coach',
  'equipment','ball','game','field','library','book','noise','smell','spoiled','insect',
  'worm','dirty','hygiene','queue','slow','late','delay','maintenance','support',
  'request','urgent','help','needed','need','available','supply','service','staff',
  'management','committee','students','people','crowd','safety','security','harassment',
  'fight','emergency','medical','injury','doctor','nurse','clinic','vehicle','parking',
  'bus','transport','kitchen','cook','taste','quality','fresh','stale',
  'rotten','sick','health','complaint','resolve','action','status','update',
  'announcement','notice','schedule','timetable','exam','assignment','marks','grade',
  'result','portal','login','password','access','account','submit','submission',
  'deadline','late','closed','open','available','unavailable','bag','phone','stolen',
  'lost','found','plumber','electrician','technician','damage',
  'leak','flood','waterproof','rain','ceiling','floor','stairs','lift','elevator',
  'line','waiting','service'
]);

const BASE_CONTEXT_WORDS = [
  'issue', 'problem', 'broken', 'not', 'work', 'stuck', 'delay', 'dirty',
  'leak', 'repair', 'urgent', 'support', 'request', 'student', 'staff',
  'classroom', 'lecture', 'complaint', 'food', 'water', 'wifi', 'speaker',
  'canteen', 'maintenance', 'crowd', 'floor', 'damage', 'noise', 'power',
  'network', 'equipment', 'server', 'hall', 'hostel', 'bathroom', 'hygiene',
  'mess', 'spoiled', 'insect', 'worm', 'smell', 'garbage', 'dust',
  'electric', 'light', 'fan', 'ac', 'projector', 'audio', 'microphone'
];

function normalizeToken(token) {
  let normalized = token.toLowerCase();
  for (const suffix of ['ing', 'ed', 'es', 's']) {
    if (normalized.length > 4 && normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length);
      break;
    }
  }
  return normalized;
}

function buildContextWords() {
  const context = new Set(BASE_CONTEXT_WORDS.map(normalizeToken));

  const addFromArray = (phrases) => {
    for (const phrase of phrases) {
      const parts = phrase.toLowerCase().match(/[a-z]{3,}/g);
      if (!parts) continue;
      for (const part of parts) {
        context.add(normalizeToken(part));
      }
    }
  };

  Object.values(CATEGORY_RULES).forEach(addFromArray);
  Object.values(PRIORITY_RULES).forEach(addFromArray);

  return context;
}

const CONTEXT_WORDS = buildContextWords();

function detectSpam(title, body) {
  if (isSpamText(title, body)) {
    return 'Complaint appears to be spam or nonsense. Please submit a detailed, genuine issue.';
  }

  const text = `${title || ''} ${body || ''}`.trim().toLowerCase();
  const tokens = (text.match(/\b\w+\b/g) || []).map((tok) => tok.toLowerCase());

  if (!text || text.length < 10) {
    return 'Complaint is too short to understand. Please add more detail.';
  }

  if (SPAM_PHRASES.some((phrase) => text.includes(phrase))) {
    return 'Complaint appears to be a sample/test submission. Please file a real issue.';
  }

  if (tokens.length) {
    const counts = tokens.reduce((acc, token) => {
      acc[token] = (acc[token] || 0) + 1;
      return acc;
    }, {});
    const { token: mostCommon, freq } = Object.entries(counts)
      .map(([token, freq]) => ({ token, freq }))
      .sort((a, b) => b.freq - a.freq)[0];

    if (freq >= 3 && freq / tokens.length >= 0.6) {
      return `Complaint repeats '${mostCommon}' too many times. Please describe the issue clearly.`;
    }
  }

  if (tokens.length < 3) {
    return 'Complaint needs more detail. Please add a clearer description of the issue.';
  }

  if (tokens.length <= 4 && new Set(tokens).size <= 2) {
    return 'Complaint description is too repetitive. Please provide more details.';
  }

  let contextualCount = 0;
  for (const token of tokens) {
    if (token.length < 3) continue;
    const canonical = normalizeToken(token);
    if (CONTEXT_WORDS.has(canonical) || CONTEXT_WORDS.has(token)) {
      contextualCount += 1;
    }
  }

  if (contextualCount === 0) {
    return 'Complaint lacks recognizable issue details. Please explain the problem in plain words.';
  }

  let meaningfulTokens = contextualCount;
  const distinctMeaningful = new Set();

  for (const token of tokens) {
    if (token.length < 3) continue;
    const canonical = normalizeToken(token);
    if (CONTEXT_WORDS.has(canonical) || CONTEXT_WORDS.has(token)) {
      distinctMeaningful.add(canonical);
    }
  }

  for (const token of tokens) {
    if (token.length < 3) continue;
    const canonical = normalizeToken(token);
    if (ENGLISH_WORDS.has(canonical) && !distinctMeaningful.has(canonical)) {
      meaningfulTokens += 1;
      distinctMeaningful.add(canonical);
    }
  }

  const meaningfulRatio = tokens.length ? meaningfulTokens / tokens.length : 0;
  if (tokens.length >= 10) {
    if (meaningfulTokens < 1 || meaningfulRatio < 0.15) {
      return 'Complaint does not include enough meaningful details. Please describe the problem clearly.';
    }
  } else if (meaningfulTokens < 2 || meaningfulRatio < 0.2) {
    return 'Complaint does not include enough meaningful details. Please describe the problem clearly.';
  }

  if (tokens.length >= 10) {
    if (distinctMeaningful.size < 3) {
      return 'Complaint repeats the same words. Add more detail about the issue.';
    }
  } else if (distinctMeaningful.size < 3) {
    return 'Complaint repeats the same words. Add more detail about the issue.';
  }

  return null;
}

/**
 * Calls the Python AI script to classify and prioritize a complaint
 * @param {string} title - Complaint title
 * @param {string} body - Complaint description
 * @returns {Promise<{committee: string, priority: string}>}
 */
export async function classifyComplaint(title, body) {
  const spamReason = detectSpam(title, body);
  if (spamReason) {
    const error = new Error(spamReason);
    error.code = 'INVALID_COMPLAINT';
    throw error;
  }

  const mlResult = classifyComplaintText(title, body);
  const ruleCommittee = ruleBasedCommittee(mlResult.cleanText);
  const rulePriority = ruleBasedPriority(mlResult.cleanText);
  
  // Debug logging to help diagnose routing issues
  console.log('Classification Debug:', {
    title,
    body,
    cleanText: mlResult.cleanText,
    mlCommittee: mlResult.committee,
    mlConfidence: mlResult.committeeConfidence,
    ruleCommittee: ruleCommittee.committee,
    ruleConfidence: ruleCommittee.confidence,
    ruleTopScore: ruleCommittee.topScore,
    ruleScores: ruleCommittee.scores,
  });
  
  let committee = mlResult.committee;
  let priority = mlResult.priority;
  let llmResult = null;

  // Immediate rule: any non-cat animal mention -> force Admin routing
  try {
    const combined = String(mlResult.cleanText || `${title || ''} ${body || ''}`);
    if (isAnimalExceptCat(combined)) {
      console.log('[AI Routing] Non-cat animal detected; forcing Admin routing');
      return {
        committee: 'Admin',
        priority: 'High',
        sources: {
          ml: mlResult,
          llm: null,
          rule: { committee: 'Admin', confidence: 1, scores: { Admin: 1 }, topScore: 1 },
        },
      };
    }
  } catch (e) {
    console.warn('[AI Routing] Animal-detection check failed:', e?.message || e);
  }

  try {
    const scriptPath = path.join(__dirname, '..', 'AI-LLM', 'categorization_and_priority_set.py');
    const pythonCmd = await resolvePythonCommand();
    const args = [
      scriptPath,
      '--title',
      String(title ?? ''),
      '--body',
      String(body ?? ''),
    ];

    const { stdout } = await execFileAsync(pythonCmd, args, {
      cwd: path.join(__dirname, '..'),
      maxBuffer: 1024 * 1024 * 10,
    });

    const jsonLine = stdout.trim().split('\n')[0];
    if (!jsonLine) {
      throw new Error('No output from AI script');
    }

    const result = JSON.parse(jsonLine);
    llmResult = result;

    if (result.status === 'invalid') {
      const error = new Error(result.message || 'Complaint rejected by AI validation');
      error.code = 'INVALID_COMPLAINT';
      throw error;
    }

    committee = selectCommittee({
      ml: mlResult,
      llm: result,
      rule: ruleCommittee,
    });
    
    console.log('Selected Committee:', {
      selected: committee,
      llmCommittee: result.committee,
      mlCommittee: mlResult.committee,
      ruleCommittee: ruleCommittee.committee,
      ruleTopScore: ruleCommittee.topScore,
      ruleConfidence: ruleCommittee.confidence,
    });

    priority = selectPriority({
      ml: mlResult,
      llm: result,
      rule: rulePriority,
    });

    return {
      committee,
      priority,
      sources: {
        ml: mlResult,
        llm: result,
        rule: {
          committee: ruleCommittee,
          priority: rulePriority,
        },
      },
    };
  } catch (error) {
    console.error('AI Classification Error:', {
      message: error?.message || error,
      code: error?.code,
      stdout: error?.stdout,
      stderr: error?.stderr,
    });
    return fallbackClassification(mlResult, ruleCommittee, rulePriority);
  }
}

/**
 * Classify a complaint into a subcategory (committee-specific).
 * Attempts to call an external LLM endpoint if configured via SUBCATEGORY_LLM_URL.
 * Falls back to simple keyword-based rules per committee.
 * Returns a short string label for the subcategory.
 */
export async function classifySubcategory(title, body, committeeType, allowedList) {
  const text = `${title || ''} ${body || ''}`.trim();
  const llmUrl = process.env.SUBCATEGORY_LLM_URL;

  const allowedByCommittee = {
    'Hostel Management': [
      'Plumbing',
      'Electrical',
      'Broken Furniture',
      'Washroom Cleanliness',
      'Pest Control',
      'Water Supply',
      'Power Supply',
      'Staff Behavior',
      'Common Area Cleanliness',
      'Animals Issue',
    ],
    'Cafeteria': [
      'Food Quality',
      'Food Variety',
      'Item Availability',
      'Overcharging',
      'Staff Behavior',
      'Slow Service',
      'Cleanliness of Tables/Utensils',
      'Waste Management',
      'Infrastructure',
      'Animals Issue',
    ],
    'Sports': [
      'Equipment Damage',
      'Equipment Shortage',
      'Ground/Court Maintenance',
      'Scheduling',
      'Safety Concerns',
      'Mismanagement During Events',
    ],
    'Tech-Support': [
      'WiFi Connectivity',
      'Slow Internet',
      'Login or Portal',
      'Computer system',
      'Software Installation',
      'Projector or Smartboard',
      'Email or Authentication',
    ],
    'Academic': [
      'Class Scheduling',
      'Faculty Availability',
      'Course Material',
      'Exam Scheduling',
      'Assignment or Marks Disputes',
      'Timetable Errors',
    ],
    'Annual Fest': [
      'Event Scheduling',
      'Venue Problems',
      'Poor Coordination',
      'Registration',
      'Logistics or Equipment Problems',
      'Volunteer Mismanagement',
      'Delay in Announcements',
      'Disturbance',
    ],
    'Cultural': [
      'Event Coordination',
      'Practice Room Availability',
      'Equipment or Technical Support',
      'Audition or Selection',
      'Mismanagement During Events',
      'Costume or Props Problems',
      'Disturbance',
    ],
    'Student Placement': [
      'Placement Process',
      'Company Visit Scheduling',
      'Communication Delay',
      'Eligibility or Criteria',
      'Interview Coordination Problems',
      'Resume Verification',
      'Pre-Placement Talk',
    ],
    'Internal Complaints': [
      'Harassment Complaints',
      'Discrimination Complaints',
      'Bullying or Ragging',
      'Staff Misconduct',
      'Student Misconduct',
      'Privacy Concerns',
      'Safety Violations',
    ],
  };

  const allowed =
    Array.isArray(allowedList) && allowedList.length
      ? allowedList
      : allowedByCommittee[committeeType] || [];

  if (llmUrl && typeof fetch === 'function' && allowed.length) {
    try {
      const resp = await fetch(llmUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, committeeType, allowed }),
      });
      if (resp.ok) {
        const json = await resp.json();
        const candidate = `${json?.subcategory || json?.category || json?.label || ''}`.trim();
        if (candidate) {
          const match = allowed.find((item) => item.toLowerCase() === candidate.toLowerCase());
          if (match) return match;
        }
      }
    } catch (error) {
      console.warn('Subcategory LLM call failed:', error?.message || error);
    }
  }

  const lowerText = text.toLowerCase();

  const rules = {
    'Hostel Management': {
      'Plumbing': ['water', 'tap', 'toilet', 'washroom', 'drain', 'leak', 'plumb'],
      'Electrical': ['electric', 'electricity', 'power', 'short circuit', 'lights', 'plug', 'power cut'],
      'Broken Furniture': ['bed', 'chair', 'table', 'furniture', 'broken', 'door', 'window'],
      'Washroom Cleanliness': ['clean', 'washroom', 'toilet', 'hygiene', 'soap', 'sanitation'],
      'Pest Control': ['pest', 'rodent', 'cockroach', 'mosquito', 'insect'],
      'Water Supply': ['no water', 'water supply', 'tap dry', 'water shortage'],
      'Power Supply': ['power supply', 'electricity cut', 'power outage'],
      'Staff Behavior': ['warden', 'staff', 'behavior', 'rude', 'misconduct'],
      'Common Area Cleanliness': ['common area', 'lobby', 'corridor', 'clean', 'garbage'],
      'Animals Issue': ['animal', 'animals', 'stray', 'dog', 'cat', 'monkey', 'bird', 'rodent'],
    },
    'Cafeteria': {
      'Food Quality': ['food', 'taste', 'spoiled', 'stale', 'quality'],
      'Food Variety': ['variety', 'menu', 'options', 'choices'],
      'Item Availability': ['available', 'out of', 'not available', 'sold out'],
      'Overcharging': ['overcharge', 'price', 'expensive', 'charged'],
      'Staff Behavior': ['staff', 'behavior', 'rude', 'service'],
      'Slow Service': ['slow', 'delay', 'long time', 'waiting'],
      'Cleanliness of Tables/Utensils': ['table', 'utensil', 'clean', 'hygiene', 'dirty'],
      'Waste Management': ['waste', 'garbage', 'trash', 'disposal'],
      'Infrastructure': ['infrastructure', 'kitchen', 'building', 'facility', 'leak'],
      'Animals Issue': ['animal', 'animals', 'rodent', 'pest', 'mouse', 'rat', 'dog', 'cat'],
    },
    'Sports': {
      'Equipment Damage': ['broken', 'damage', 'torn', 'crack', 'damaged equipment'],
      'Equipment Shortage': ['shortage', 'not enough', 'insufficient', 'lack'],
      'Ground/Court Maintenance': ['ground', 'court', 'maintenance', 'field', 'pitch'],
      'Scheduling': ['schedule', 'timing', 'clash', 'conflict'],
      'Safety Concerns': ['safety', 'unsafe', 'injury', 'danger'],
      'Mismanagement During Events': ['mismanagement', 'coordination', 'organize', 'event problem'],
    },
    'Tech-Support': {
      'WiFi Connectivity': ['wifi', 'connectivity', 'router', 'connection'],
      'Slow Internet': ['slow internet', 'latency', 'slow', 'bandwidth'],
      'Login or Portal': ['login', 'portal', 'password', 'signin', 'access'],
      'Computer system': ['computer', 'pc', 'system', 'hardware', 'boot'],
      'Software Installation': ['install', 'installation', 'software', 'setup'],
      'Projector or Smartboard': ['projector', 'smartboard', 'display', 'screen'],
      'Email or Authentication': ['email', 'auth', 'authentication', 'otp'],
    },
    'Academic': {
      'Class Scheduling': ['class schedule', 'class timing', 'schedule', 'slot'],
      'Faculty Availability': ['faculty', 'teacher', 'availability', 'absent', 'not available'],
      'Course Material': ['material', 'notes', 'syllabus', 'resource', 'content'],
      'Exam Scheduling': ['exam', 'exam schedule', 'date', 'timing'],
      'Assignment or Marks Disputes': ['assignment', 'marks', 'grade', 'dispute', 'evaluation'],
      'Timetable Errors': ['timetable', 'timetable error', 'timetable issue', 'clash'],
    },
    'Annual Fest': {
      'Event Scheduling': ['event schedule', 'schedule', 'timing', 'clash'],
      'Venue Problems': ['venue', 'location', 'place', 'hall', 'stage'],
      'Poor Coordination': ['coordination', 'organize', 'management', 'mismanage'],
      'Registration': ['registration', 'signup', 'register', 'form'],
      'Logistics or Equipment Problems': ['logistic', 'equipment', 'sound', 'transport'],
      'Volunteer Mismanagement': ['volunteer', 'volunteers', 'mismanage'],
      'Delay in Announcements': ['announcement', 'delay', 'notice'],
      'Disturbance': ['disturb', 'noise', 'disturbance'],
    },
    'Cultural': {
      'Event Coordination': ['coordination', 'organize', 'management', 'mismanage'],
      'Practice Room Availability': ['practice room', 'availability', 'room', 'space'],
      'Equipment or Technical Support': ['sound', 'mic', 'equipment', 'technical'],
      'Audition or Selection': ['audition', 'selection', 'tryout'],
      'Mismanagement During Events': ['mismanage', 'coordination', 'organize'],
      'Costume or Props Problems': ['costume', 'props', 'dress', 'prop'],
      'Disturbance': ['disturb', 'noise', 'disturbance'],
    },
    'Student Placement': {
      'Placement Process': ['placement', 'process', 'placements'],
      'Company Visit Scheduling': ['company visit', 'company', 'visit', 'schedule'],
      'Communication Delay': ['communication', 'delay', 'email', 'response'],
      'Eligibility or Criteria': ['eligibility', 'criteria'],
      'Interview Coordination Problems': ['interview', 'coordination', 'slot', 'schedule'],
      'Resume Verification': ['resume', 'verification', 'cv', 'document'],
      'Pre-Placement Talk': ['pre-placement', 'ppt', 'talk', 'session'],
    },
    'Internal Complaints': {
      'Harassment Complaints': ['harass', 'harassment', 'sexual', 'assault', 'ragging'],
      'Discrimination Complaints': ['discriminat', 'discrimination', 'bias'],
      'Bullying or Ragging': ['bully', 'bullying', 'ragging'],
      'Staff Misconduct': ['staff misconduct', 'staff', 'misconduct'],
      'Student Misconduct': ['student misconduct', 'student', 'misconduct'],
      'Privacy Concerns': ['privacy', 'data', 'confidential'],
      'Safety Violations': ['safety', 'violation', 'unsafe', 'danger'],
    },
  };

  const committeeRules = rules[committeeType] || {};
  for (const [label, keywords] of Object.entries(committeeRules)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        const allowedMatch = allowed.find((item) => item.toLowerCase() === label.toLowerCase());
        return allowedMatch || label;
      }
    }
  }

  for (const entry of allowed) {
    const pivot = entry?.split(' ')[0]?.toLowerCase();
    if (pivot && lowerText.includes(pivot)) {
      return entry;
    }
  }

  return null;
}

/**
 * Count keyword matches for each rule bucket.
 * @param {string} text
 * @param {Record<string, string[]>} rules
 */
function getMatchScores(text, rules) {
  const scores = {};
  for (const [key, keywords] of Object.entries(rules)) {
    const count = keywords.reduce((acc, keyword) => (text.includes(keyword) ? acc + 1 : acc), 0);
    if (count > 0) {
      scores[key] = count;
    }
  }
  return scores;
}

/**
 * Detects presence of animal-related terms (excluding cats).
 * If any of the configured animal words (except cat) appears as a whole word,
 * treat it as an animal issue that should be escalated to Admin.
 */
function isAnimalExceptCat(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  // list of animals to escalate (do not include cat/cats/kittens)
  const ANIMAL_WORDS = [
    'monkey', 'monkeys', 'dog', 'dogs', 'stray', 'strays', 'bird', 'birds', 'pigeon', 'pigeons',
    'rat', 'rats', 'rodent', 'rodents', 'snake', 'snakes', 'cow', 'cows', 'buffalo', 'buffaloes',
    'goat', 'goats', 'pig', 'pigs', 'deer', 'deers', 'bat', 'bats', 'lizard', 'fox', 'foxes'
  ];

  for (const animal of ANIMAL_WORDS) {
    const re = new RegExp("\\b" + animal.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\b", 'i');
    if (re.test(lower)) return true;
  }
  return false;
}

function fallbackClassification(mlResult, ruleCommittee, rulePriority) {
  const committee = selectCommittee({
    ml: mlResult,
    llm: null,
    rule: ruleCommittee,
  });

  const priority = selectPriority({
    ml: mlResult,
    llm: null,
    rule: rulePriority,
  });

  return {
    committee,
    priority,
    sources: {
      ml: mlResult,
      rule: {
        committee: ruleCommittee,
        priority: rulePriority,
      },
      fallback: true,
    },
  };
}

function ruleBasedCommittee(text) {
  const categoryScores = getMatchScores(text, CATEGORY_RULES);

  // ❌ Do NOT default to Academic on "no match"
  if (!Object.keys(categoryScores).length) {
    return { committee: null, confidence: 0, scores: categoryScores, topScore: 0 };
  }

  const sorted = Object.entries(categoryScores).sort((a, b) => {
    if (b[1] === a[1]) {
      return b[0].length - a[0].length;
    }
    return b[1] - a[1];
  });

  const [topCommittee, topScore] = sorted[0];
  const secondScore = sorted[1]?.[1] || 0;
  const totalScore = sorted.reduce((sum, [, score]) => sum + score, 0) || 1;

  let confidence = topScore / totalScore;
  if (topScore >= 2 && topScore > secondScore * 1.5) {
    confidence = Math.min(confidence + 0.2, 0.95);
  }
  if (topScore >= 3) {
    confidence = Math.min(confidence + 0.1, 0.95);
  }

  return {
    committee: topCommittee,
    confidence,
    scores: categoryScores,
    topScore: topScore || 0,
  };
}


function ruleBasedPriority(text) {
  for (const keyword of PRIORITY_RULES.High) {
    if (text.includes(keyword)) {
      return { priority: 'High', confidence: 1 };
    }
  }

  for (const keyword of PRIORITY_RULES.Medium) {
    if (text.includes(keyword)) {
      return { priority: 'Medium', confidence: 0.7 };
    }
  }

  for (const keyword of PRIORITY_RULES.Low) {
    if (text.includes(keyword)) {
      return { priority: 'Low', confidence: 0.4 };
    }
  }

  return { priority: 'Medium', confidence: 0 };
}

function selectCommittee({ ml, llm, rule }) {
  if (llm?.status === 'invalid') {
    return fallbackCommittee(ml, rule);
  }

  // Priority 1: Rule-based matching with STRONG keyword matches (most reliable)
  // If rule has 2+ keyword matches, it should override LLM/ML unless they strongly agree
  if (rule.committee && rule.committee !== 'Academic') {
    // Very strong match: 3+ keywords matched - ALWAYS use rule
    if (rule.topScore >= 3) {
      return rule.committee;
    }
    // Strong match: 2+ keywords matched - override unless LLM/ML strongly agree with each other
    if (rule.topScore >= 2) {
      // If LLM says Academic, override it
      if (!llm?.committee || llm.committee === 'Academic') {
        return rule.committee;
      }
      // If LLM and ML both agree with rule, use rule
      if (llm.committee === rule.committee && ml.committee === rule.committee) {
        return rule.committee;
      }
      // If ML agrees with rule but LLM disagrees, trust rule (rule is more reliable for keywords)
      if (ml.committee === rule.committee && ml.committeeConfidence >= 0.3) {
        return rule.committee;
      }
      // If rule has 2+ matches and LLM disagrees, still prefer rule for keyword-based issues
      // (LLM might misinterpret, but keywords are explicit)
      if (rule.confidence >= 0.5) {
        return rule.committee;
      }
    }
    // High confidence match (even with 1 keyword if confidence is high)
    if (rule.confidence >= 0.6) {
      // Override Academic from LLM
      if (!llm?.committee || llm.committee === 'Academic' || llm.committee === rule.committee) {
        return rule.committee;
      }
    }
    // Moderate confidence: use if ML agrees or LLM is Academic
    if (rule.confidence >= 0.4) {
      if (ml.committee === rule.committee || !llm?.committee || llm.committee === 'Academic') {
        return rule.committee;
      }
    }
  }

  // Priority 2: LLM result (if available and not Academic)
  if (llm?.committee && ALLOWED_COMMITTEES.includes(llm.committee)) {
    if (llm.committee !== 'Academic') {
      // Use LLM if rule doesn't strongly disagree (rule already checked above)
      if (!rule.committee || rule.committee === llm.committee || rule.topScore < 2) {
        return llm.committee;
      }
    }
  }

  // Priority 3: ML result with good confidence
  if (ml.committee && ml.committee !== 'Academic' && ml.committeeConfidence >= 0.4) {
    // Use ML if rule doesn't strongly disagree
    if (!rule.committee || rule.committee === ml.committee || rule.topScore < 2) {
      return ml.committee;
    }
  }

  // Priority 4: Rule-based with any confidence (better than Academic default)
  if (rule.committee && rule.committee !== 'Academic') {
    return rule.committee;
  }

  // Priority 5: ML with lower confidence
  if (ml.committee && ml.committee !== 'Academic' && ml.committeeConfidence >= 0.3) {
    return ml.committee;
  }

  // Fallback: LLM, ML, Rule, or Academic
  return llm?.committee || ml.committee || rule.committee || 'Academic';
}

function selectPriority({ ml, llm, rule }) {
  if (llm?.status === 'invalid') {
    return fallbackPriority(ml, rule);
  }

  const priorityRank = { High: 3, Medium: 2, Low: 1 };

  if (rule.priority === 'High' || ml.priority === 'High' || llm?.priority === 'High') {
    return 'High';
  }

  if (llm?.priority) {
    if (llm.priority === 'Low') {
      if (rule.priority === 'Medium' || ml.priority === 'Medium') {
        return 'Medium';
      }
    }
    return llm.priority;
  }

  if (ml.priority === 'Medium' || rule.priority === 'Medium') {
    return 'Medium';
  }

  const highest = [ml.priority, rule.priority].filter(Boolean);
  return highest[0] || 'Medium';
}

function fallbackCommittee(ml, rule) {
  // Prioritize rule-based matching in fallback too
  if (rule.committee && rule.committee !== 'Academic') {
    // If rule has strong match, use it
    if (rule.topScore >= 2 || rule.confidence >= 0.4) {
      return rule.committee;
    }
    // Even with weak match, prefer over Academic
    return rule.committee;
  }
  if (ml.committee && ml.committee !== 'Academic') {
    return ml.committee;
  }
  return ml.committee || rule.committee || 'Academic';
}

function fallbackPriority(ml, rule) {
  if (ml.priority === 'High' || rule.priority === 'High') {
    return 'High';
  }
  if (ml.priority === 'Medium' || rule.priority === 'Medium') {
    return 'Medium';
  }
  return ml.priority || rule.priority || 'Medium';
}

