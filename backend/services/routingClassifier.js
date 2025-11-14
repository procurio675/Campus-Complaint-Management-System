import natural from 'natural';

const committeeTrainingData = [
  // Hostel Management - expanded
  { text: 'water leakage in hostel bathroom drain clogged dorm floor flooding', label: 'Hostel Management' },
  { text: 'fan and lights not working in hostel room maintenance request', label: 'Hostel Management' },
  { text: 'lift stuck in hostel block need maintenance support', label: 'Hostel Management' },
  { text: 'pipe burst in dormitory corridor water everywhere', label: 'Hostel Management' },
  { text: 'washroom cleaning issue hostel bathroom very dirty', label: 'Hostel Management' },
  { text: 'laundry room machines broken hostel students affected', label: 'Hostel Management' },
  { text: 'water clogging in hostel sink bathroom drain blocked since morning', label: 'Hostel Management' },
  { text: 'sewage smell from hostel bathrooms drainage overflowing', label: 'Hostel Management' },
  { text: 'water clogging sink floor morning', label: 'Hostel Management' },
  { text: 'water clogging in sink of my floor', label: 'Hostel Management' },
  { text: 'sink clogged water not draining hostel room', label: 'Hostel Management' },
  { text: 'bathroom sink blocked water overflowing floor', label: 'Hostel Management' },
  { text: 'water clogging in sink bathroom floor', label: 'Hostel Management' },
  { text: 'hostel room sink water clogging since morning', label: 'Hostel Management' },
  { text: 'drain blocked sink water not going down', label: 'Hostel Management' },
  { text: 'water leak from ceiling hostel room', label: 'Hostel Management' },
  { text: 'electricity problem hostel room power cut', label: 'Hostel Management' },
  { text: 'hostel bathroom tap not working water issue', label: 'Hostel Management' },
  { text: 'hostel room door lock broken need repair', label: 'Hostel Management' },
  { text: 'hostel warden complaint room maintenance', label: 'Hostel Management' },
  { text: 'hostel residence dormitory issue', label: 'Hostel Management' },
  { text: 'plumbing issue hostel bathroom toilet', label: 'Hostel Management' },
  { text: 'hostel room window broken need fixing', label: 'Hostel Management' },

  // Cafeteria - expanded
  { text: 'worms found in mess food canteen hygiene very poor', label: 'Cafeteria' },
  { text: 'food poisoning after dinner in cafeteria', label: 'Cafeteria' },
  { text: 'canteen staff rude and dirty tables require cleaning', label: 'Cafeteria' },
  { text: 'stale food served in mess kitchen please inspect', label: 'Cafeteria' },
  { text: 'water clogging near canteen entrance slippery floor', label: 'Cafeteria' },
  { text: 'insect found in mess food today lunch', label: 'Cafeteria' },
  { text: 'canteen food quality poor hygiene issue', label: 'Cafeteria' },
  { text: 'mess food contaminated spoiled meal', label: 'Cafeteria' },
  { text: 'cafeteria dining hall dirty tables', label: 'Cafeteria' },
  { text: 'canteen meal service slow long queue', label: 'Cafeteria' },
  { text: 'mess kitchen food preparation issue', label: 'Cafeteria' },
  { text: 'cafeteria snack counter closed early', label: 'Cafeteria' },
  { text: 'canteen cook staff behavior complaint', label: 'Cafeteria' },

  // Tech-Support - expanded
  { text: 'wifi down in academic block cannot access internet', label: 'Tech-Support' },
  { text: 'projector not working in lecture hall needs repair', label: 'Tech-Support' },
  { text: 'smart board touch not responding in classroom', label: 'Tech-Support' },
  { text: 'computer lab systems crashing need technician', label: 'Tech-Support' },
  { text: 'printer jammed in library cannot print notes', label: 'Tech-Support' },
  { text: 'login portal not working student account', label: 'Tech-Support' },
  { text: 'website down cannot access online portal', label: 'Tech-Support' },
  { text: 'network connection slow internet problem', label: 'Tech-Support' },
  { text: 'server error system not responding', label: 'Tech-Support' },
  { text: 'software installation needed lab computer', label: 'Tech-Support' },
  { text: 'microphone speaker audio not working classroom', label: 'Tech-Support' },
  { text: 'screen display problem projector screen', label: 'Tech-Support' },
  { text: 'it support technical issue computer system', label: 'Tech-Support' },
  { text: 'digital app not working mobile application', label: 'Tech-Support' },

  // Sports - expanded
  { text: 'football ground lights broken training affected', label: 'Sports' },
  { text: 'badminton court roof leaking during practice', label: 'Sports' },
  { text: 'gym equipment damaged and unsafe', label: 'Sports' },
  { text: 'coach absent for basketball practice need replacement', label: 'Sports' },
  { text: 'stadium ground maintenance issue', label: 'Sports' },
  { text: 'sports equipment broken need replacement', label: 'Sports' },
  { text: 'tournament schedule conflict sports event', label: 'Sports' },
  { text: 'playground equipment damaged unsafe', label: 'Sports' },
  { text: 'fitness gym facility not available', label: 'Sports' },
  { text: 'sports practice session cancelled', label: 'Sports' },

  // Academic - expanded
  { text: 'professor absent repeated lecture cancelled', label: 'Academic' },
  { text: 'doubt about exam timetable and reschedule request', label: 'Academic' },
  { text: 'assignment grading incorrect please review marks', label: 'Academic' },
  { text: 'classroom overcrowded need extra section', label: 'Academic' },
  { text: 'syllabus coverage delayed need remedial class', label: 'Academic' },
  { text: 'faculty teacher not coming to class', label: 'Academic' },
  { text: 'course registration problem cannot enroll', label: 'Academic' },
  { text: 'attendance marks incorrect need correction', label: 'Academic' },
  { text: 'lecture hall class schedule conflict', label: 'Academic' },
  { text: 'seminar workshop tutorial session issue', label: 'Academic' },
  { text: 'laboratory lab session equipment academic', label: 'Academic' },
  { text: 'marks grade result incorrect need review', label: 'Academic' },

  // Internal Complaints - expanded
  { text: 'ragging incident reported hostel seniors threatening', label: 'Internal Complaints' },
  { text: 'harassment by staff need disciplinary action', label: 'Internal Complaints' },
  { text: 'theft and violence in campus security issue', label: 'Internal Complaints' },
  { text: 'bullying in classroom seek immediate help', label: 'Internal Complaints' },
  { text: 'assault incident safety concern campus', label: 'Internal Complaints' },
  { text: 'discrimination misconduct complaint report', label: 'Internal Complaints' },
  { text: 'abuse threat violence safety incident', label: 'Internal Complaints' },

  // Annual Fest - expanded
  { text: 'annual fest stage lights request and volunteer management', label: 'Annual Fest' },
  { text: 'sponsorship coordination for annual festival event', label: 'Annual Fest' },
  { text: 'cultural team needs rehearsal space for fest', label: 'Annual Fest' },
  { text: 'festival event celebration gala show', label: 'Annual Fest' },
  { text: 'annual fest volunteer coordination issue', label: 'Annual Fest' },

  // Cultural - expanded
  { text: 'dance club practice room unavailable before competition', label: 'Cultural' },
  { text: 'music event sound system problem cultural night', label: 'Cultural' },
  { text: 'drama club costume budget approval', label: 'Cultural' },
  { text: 'cultural performance competition event', label: 'Cultural' },
  { text: 'arts theatre drama music dance club', label: 'Cultural' },

  // Student Placement - expanded
  { text: 'placement drive schedule clashing with exams', label: 'Student Placement' },
  { text: 'company interview delayed placement cell support', label: 'Student Placement' },
  { text: 'resume workshop request from placement office', label: 'Student Placement' },
  { text: 'internship opportunity placement drive', label: 'Student Placement' },
  { text: 'job offer recruiter career interview', label: 'Student Placement' },
  { text: 'aptitude test placement preparation', label: 'Student Placement' },
];

const priorityTrainingData = [
  { text: 'harassment incident urgent safety help', label: 'High' },
  { text: 'fire in hostel kitchen emergency', label: 'High' },
  { text: 'electric sparks from switchboard danger', label: 'High' },
  { text: 'worms in cafeteria food health risk', label: 'High' },
  { text: 'water clogging causing flood in hostel bathroom', label: 'High' },
  { text: 'water clogging in hostel sink causing overflow slippery floor', label: 'High' },
  { text: 'medical emergency no doctor available', label: 'High' },

  { text: 'wifi down entire campus need fix soon', label: 'Medium' },
  { text: 'projector not working lecture disrupted', label: 'Medium' },
  { text: 'bus transport delay causes inconvenience', label: 'Medium' },
  { text: 'ac not working in classroom uncomfortable', label: 'Medium' },
  { text: 'assignment portal unreachable deadline near', label: 'Medium' },

  { text: 'request for new books in library', label: 'Low' },
  { text: 'suggestion to extend gym hours', label: 'Low' },
  { text: 'query about festival passes', label: 'Low' },
  { text: 'notice board needs update', label: 'Low' },
  { text: 'request to plant more trees on campus', label: 'Low' },
];

let committeeClassifier = null;
let priorityClassifier = null;

function ensureCommitteeClassifier() {
  if (committeeClassifier) return committeeClassifier;
  try {
    committeeClassifier = new natural.BayesClassifier();
    for (const item of committeeTrainingData) {
      committeeClassifier.addDocument(item.text.toLowerCase(), item.label);
    }
    committeeClassifier.train();
    // Verify training was successful
    if (!committeeClassifier.classifier || Object.keys(committeeClassifier.classifier.classFeatures || {}).length === 0) {
      throw new Error('Classifier training failed');
    }
  } catch (error) {
    console.error('Error initializing committee classifier:', error);
    // Reset and retry
    committeeClassifier = null;
    throw error;
  }
  return committeeClassifier;
}

function ensurePriorityClassifier() {
  if (priorityClassifier) return priorityClassifier;
  try {
    priorityClassifier = new natural.BayesClassifier();
    for (const item of priorityTrainingData) {
      priorityClassifier.addDocument(item.text.toLowerCase(), item.label);
    }
    priorityClassifier.train();
    // Verify training was successful
    if (!priorityClassifier.classifier || Object.keys(priorityClassifier.classifier.classFeatures || {}).length === 0) {
      throw new Error('Classifier training failed');
    }
  } catch (error) {
    console.error('Error initializing priority classifier:', error);
    // Reset and retry
    priorityClassifier = null;
    throw error;
  }
  return priorityClassifier;
}

const HIGH_SEVERITY_KEYWORDS = [
  'harassment', 'ragging', 'assault', 'violence', 'safety', 'threat',
  'electric spark', 'short circuit', 'fire', 'injury', 'medical', 'emergency',
  'worm', 'worms', 'insect', 'spoiled food', 'contamination', 'flood', 'flooding',
  'water clog', 'water clogging', 'gas leak', 'danger'
];

export function classifyComplaintText(title, body) {
  const text = `${title || ''} ${body || ''}`.toLowerCase();
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // ❌ DON’T default to "Academic" here
  // Let it be null, and let rule-based + LLM decide later
  let committee = null;
  let committeeConfidence = 0;
  let committeeScores = [];
  let priority = null;
  let priorityConfidence = 0;
  let priorityScores = [];

  try {
    const committeeModel = ensureCommitteeClassifier();
    const priorityModel = ensurePriorityClassifier();

    // Committee classification
    try {
      committeeScores = committeeModel.getClassifications(cleanText);
      if (committeeScores && committeeScores.length > 0) {
        committee = committeeModel.classify(cleanText);
        committeeConfidence =
          committeeScores.find((score) => score.label === committee)?.value || 0;
        // Treat very low-confidence predictions as "no confident match"
        if (committeeConfidence < 0.3) {
          committee = null;
          committeeConfidence = 0;
        }
      }
    } catch (error) {
      console.error('Error classifying committee:', error);
      committee = null;
      committeeConfidence = 0;
    }

    // Priority classification
    try {
      priorityScores = priorityModel.getClassifications(cleanText);
      if (priorityScores && priorityScores.length > 0) {
        priority = priorityModel.classify(cleanText);
        priorityConfidence =
          priorityScores.find((score) => score.label === priority)?.value || 0;
      }
    } catch (error) {
      console.error('Error classifying priority:', error);
      priority = null;
      priorityConfidence = 0;
    }
  } catch (error) {
    console.error('Error initializing classifiers:', error);
    // Leave committee/priority as null so downstream logic + rules handle it
  }

  // Override priority for high severity keywords
  if (HIGH_SEVERITY_KEYWORDS.some((kw) => cleanText.includes(kw))) {
    priority = 'High';
    priorityConfidence = Math.max(priorityConfidence, 0.7);
  }

  // Do not force committee to 'Academic'; leave it null for downstream resolution
  if (!priority) priority = 'Medium';

  return {
    committee,
    committeeConfidence,
    committeeScores,
    priority,
    priorityConfidence,
    priorityScores,
    cleanText,
  };
}
