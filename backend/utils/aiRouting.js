import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Calls the Python AI script to classify and prioritize a complaint
 * @param {string} title - Complaint title
 * @param {string} body - Complaint description
 * @returns {Promise<{committee: string, priority: string}>}
 */
export async function classifyComplaint(title, body) {
  try {
    // Escape special characters in title and body for command line
    const escapedTitle = title.replace(/"/g, '\\"').replace(/'/g, "\\'");
    const escapedBody = (body || '').replace(/"/g, '\\"').replace(/'/g, "\\'");
    
    // Get the path to the Python script
    const scriptPath = path.join(__dirname, '..', 'AI-LLM', 'categorization_and_priority_set.py');
    
    // Build the command - use python3 or python depending on system
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const command = `${pythonCmd} "${scriptPath}" --title "${escapedTitle}" --body "${escapedBody}"`;
    
    // Execute the Python script
    const { stdout, stderr } = await execAsync(command, {
      cwd: path.join(__dirname, '..'),
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
    
    // Parse the JSON output from stdout
    // The script outputs JSON on the first line, then error messages on stderr
    const jsonLine = stdout.trim().split('\n')[0];
    
    if (!jsonLine) {
      throw new Error('No output from AI script');
    }
    
    const result = JSON.parse(jsonLine);
    
    // Validate the result
    if (!result.committee || !result.priority) {
      throw new Error('Invalid response from AI script');
    }
    
    return {
      committee: result.committee,
      priority: result.priority,
    };
  } catch (error) {
    console.error('AI Classification Error:', error);
    
    // Fallback to rule-based classification if AI fails
    return fallbackClassification(title, body);
  }
}

/**
 * Classify a complaint into a subcategory (committee-specific).
 * Attempts to call an external LLM endpoint if configured via SUBCATEGORY_LLM_URL.
 * Falls back to simple keyword-based rules per committee.
 * Returns a short string label for the subcategory.
 */
export async function classifySubcategory(title, body, committeeType, allowedList) {
  const text = (title || '') + ' ' + (body || '');
  const llmUrl = process.env.SUBCATEGORY_LLM_URL;

  // Known allowed subcategories per committee (as provided)
  const allowedByCommittee = {
    'Hostel Management': ['Plumbing','Electrical','Broken Furniture','Washroom Cleanliness','Pest Control','Water Supply','Power Supply','Staff Behavior','Common Area Cleanliness','Animals Issue'],
    'Cafeteria': ['Food Quality','Food Variety','Item Availability','Overcharging','Staff Behavior','Slow Service','Cleanliness of Tables/Utensils','Waste Management','Infrastructure','Animals Issue'],
    'Sports': ['Equipment Damage','Equipment Shortage','Ground/Court Maintenance','Scheduling','Safety Concerns','Mismanagement During Events'],
    'Tech-Support': ['WiFi Connectivity','Slow Internet','Login or Portal','Computer system','Software Installation','Projector or Smartboard','Email or Authentication'],
    'Academic': ['Class Scheduling','Faculty Availability','Course Material','Exam Scheduling','Assignment or Marks Disputes','Timetable Errors'],
    'Annual Fest': ['Event Scheduling','Venue Problems','Poor Coordination','Registration','Logistics or Equipment Problems','Volunteer Mismanagement','Delay in Announcements','Disturbance'],
    'Cultural': ['Event Coordination','Practice Room Availability','Equipment or Technical Support','Audition or Selection','Mismanagement During Events','Costume or Props Problems','Disturbance'],
    'Student Placement': ['Placement Process','Company Visit Scheduling','Communication Delay','Eligibility or Criteria','Interview Coordination Problems','Resume Verification','Pre-Placement Talk'],
    'Internal Complaints': ['Harassment Complaints','Discrimination Complaints','Bullying or Ragging','Staff Misconduct','Student Misconduct','Privacy Concerns','Safety Violations'],
  };

  const allowed = Array.isArray(allowedList) && allowedList.length ? allowedList : (allowedByCommittee[committeeType] || []);

  // Ask LLM if configured, providing allowed list so it must choose one
  if (llmUrl && typeof fetch === 'function') {
    try {
      const resp = await fetch(llmUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, committeeType, allowed }),
        // no timeout handling here; rely on environment
      });
      if (resp.ok) {
        const json = await resp.json();
        const candidate = (json?.subcategory || json?.category || json?.label || '') + '';
        const norm = candidate.trim();
        if (norm) {
          // Try to match candidate to allowed list (case-insensitive)
          const match = allowed.find(a => a.toLowerCase() === norm.toLowerCase());
          if (match) return match;
        }
      }
    } catch (err) {
      console.warn('Subcategory LLM call failed:', err?.message || err);
    }
  }

  // Rule-based mapping constrained to allowed list
  const t = (text || '').toLowerCase();

  const rules = {
    'Hostel Management': {
      'Plumbing': ['water','tap','toilet','washroom','drain','leak','plumb'],
      'Electrical': ['electric','electricity','power','short circuit','lights','plug','power cut'],
      'Broken Furniture': ['bed','chair','table','furnitur','broken','door','window'],
      'Washroom Cleanliness': ['clean','washroom','toilet','hygiene','soap','sanitation'],
      'Pest Control': ['pest','rodent','cockroach','mosquito','insect'],
      'Water Supply': ['no water','water supply','tap dry','water shortage'],
      'Power Supply': ['power supply','electricity cut','power outage'],
      'Staff Behavior': ['warden','staff','behavior','rude','misconduct'],
      'Common Area Cleanliness': ['common area','lobby','corridor','clean','garbage'],
      'Animals': ['animal','animals','stray','dog','cat','monkey','bird','rodent'],
    },
    'Cafeteria': {
      'Food Quality': ['food','taste','spoiled','stale','quality'],
      'Food Variety': ['variety','menu','options','choices'],
      'Item Availability': ['available','out of','not available','sold out'],
      'Overcharging': ['overcharge','price','expensive','charged'],
      'Staff Behavior': ['staff','behavior','rude','service'],
      'Slow Service': ['slow','delay','long time','waiting'],
      'Cleanliness of Tables/Utensils': ['table','utensil','clean','hygiene','dirty'],
      'Waste Management': ['waste','garbage','trash','disposal'],
      'Infrastructure': ['infrastructure','kitchen','building','facility','leak'],
      'Animals': ['animal','animals','rodent','pest','mouse','rat','dog','cat'],
    },
    'Sports': {
      'Equipment Damage': ['broken','damage','torn','crack','damaged equipment'],
      'Equipment Shortage': ['shortage','not enough','insufficient','lack'],
      'Ground/Court Maintenance': ['ground','court','maintenance','field','pitch'],
      'Scheduling': ['schedule','timing','clash','conflict'],
      'Safety Concerns': ['safety','unsafe','injury','danger'],
      'Mismanagement During Events': ['mismanagement','coordination','organize','event problem'],
    },
    'Tech-Support': {
      'WiFi Connectivity': ['wifi','connectivity','router','connection'],
      'Slow Internet': ['slow internet','latency','slow','bandwidth'],
      'Login or Portal': ['login','portal','password','signin','access'],
      'Computer system': ['computer','pc','system','hardware','boot'],
      'Software Installation': ['install','installation','software','setup'],
      'Projector or Smartboard': ['projector','smartboard','display','screen'],
      'Email or Authentication': ['email','auth','authentication','otp'],
    },
    'Academic': {
      'Class Scheduling': ['class schedule','class timing','schedule','slot'],
      'Faculty Availability': ['faculty','teacher','availability','absent','not available'],
      'Course Material': ['material','notes','syllabus','resource','content'],
      'Exam Scheduling': ['exam','exam schedule','date','timing'],
      'Assignment or Marks Disputes': ['assignment','marks','grade','dispute','evaluation'],
      'Timetable Errors': ['timetable','timetable error','timetable issue','clash'],
    },
    'Annual Fest': {
      'Event Scheduling': ['event schedule','schedule','timing','clash'],
      'Venue Problems': ['venue','location','place','hall','stage'],
      'Poor Coordination': ['coordination','organize','management','mismanage'],
      'Registration': ['registration','signup','register','form'],
      'Logistics or Equipment Problems': ['logistic','equipment','sound','transport'],
      'Volunteer Mismanagement': ['volunteer','volunteers','mismanage'],
      'Delay in Announcements': ['announcement','delay','notice'],
      'Disturbance': ['disturb','noise','disturbance'],
    },
    'Cultural': {
      'Event Coordination': ['coordination','organize','management','mismanage'],
      'Practice Room Availability': ['practice room','availability','room','space'],
      'Equipment or Technical Support': ['sound','mic','equipment','technical'],
      'Audition or Selection': ['audition','selection','tryout'],
      'Mismanagement During Events': ['mismanage','coordination','organize'],
      'Costume or Props Problems': ['costume','props','dress','prop'],
      'Disturbance': ['disturb','noise','disturbance'],
    },
    'Student Placement': {
      'Placement Process': ['placement','process','placements'],
      'Company Visit Scheduling': ['company visit','company','visit','schedule'],
      'Communication Delay': ['communication','delay','email','response'],
      'Eligibility or Criteria': ['eligibility','criteria','criteria'],
      'Interview Coordination Problems': ['interview','coordination','slot','schedule'],
      'Resume Verification': ['resume','verification','cv','document'],
      'Pre-Placement Talk': ['pre-placement','ppt','talk','session'],
    },
    'Internal Complaints': {
      'Harassment Complaints': ['harass','harassment','sexual','assault','ragging'],
      'Discrimination Complaints': ['discriminat','discrimination','bias'],
      'Bullying or Ragging': ['bully','bullying','ragging'],
      'Staff Misconduct': ['staff misconduct','staff','misconduct'],
      'Student Misconduct': ['student misconduct','student','misconduct'],
      'Privacy Concerns': ['privacy','data','confidential'],
      'Safety Violations': ['safety','violation','unsafe','danger'],
    }
  };

  const committeeRules = rules[committeeType] || {};

  // Try to match rules
  for (const [label, kws] of Object.entries(committeeRules)) {
    for (const kw of kws) {
      if (t.includes(kw)) return label;
    }
  }

  // As a last resort, try to map to any allowed keyword by substring
  for (const a of allowed) {
    if (!a) continue;
    if (t.includes(a.toLowerCase().split(' ')[0])) return a;
  }

  // If nothing matched, return null to indicate no matching subcategory
  return null;
}

/**
 * Fallback rule-based classification when AI fails
 * @param {string} title - Complaint title
 * @param {string} body - Complaint description
 * @returns {{committee: string, priority: string}}
 */
function fallbackClassification(title, body) {
  const text = (title + ' ' + (body || '')).toLowerCase();
  
  // Committee rules
  const categoryRules = {
    'Hostel Management': ['water', 'electric', 'electricity', 'maintenance', 'clean', 'washroom', 'bathroom', 'room', 'wifi', 'warden', 'hostel'],
    'Cafeteria': ['food', 'canteen', 'mess', 'meal', 'dining', 'hygiene'],
    'Tech-Support': ['login', 'portal', 'wifi', 'internet', 'printer', 'server', 'software', 'website', 'network'],
    'Sports': ['ground', 'stadium', 'equipment', 'tournament', 'coach', 'sports'],
    'Academic': ['exam', 'lecture', 'faculty', 'course', 'attendance', 'assignment', 'grade', 'marks', 'timetable'],
    'Internal Complaints': ['harassment', 'ragging', 'bullying', 'assault', 'discrimination', 'misconduct'],
    'Annual Fest': ['event', 'fest', 'annual', 'volunteer', 'sponsor', 'celebration'],
    'Cultural': ['dance', 'music', 'drama', 'club', 'competition', 'cultural'],
    'Student Placement': ['internship', 'placement', 'company', 'drive', 'resume', 'job', 'offer']
  };
  
  // Priority rules
  const priorityRules = {
    'High': ['water', 'electricity', 'electrocute', 'fire', 'gas', 'medical', 'harassment', 'assault', 'ragging', 'emergency'],
    'Medium': ['wifi', 'printer', 'assignment', 'grades', 'cleaning', 'software', 'portal', 'login'],
    'Low': ['event', 'cultural', 'sports', 'food', 'festival', 'mess']
  };
  
  // Find committee
  let committee = 'Academic'; // default
  for (const [cat, keywords] of Object.entries(categoryRules)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      committee = cat;
      break;
    }
  }
  
  // Find priority
  let priority = 'Medium'; // default
  for (const [pri, keywords] of Object.entries(priorityRules)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      priority = pri;
      break;
    }
  }
  
  return { committee, priority };
}

