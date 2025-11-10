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

