# AI-LLM Complaint Classification

This directory contains the Python script for AI-powered complaint classification using Google's Gemini model.

## Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables in the backend `.env` file:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   GEMINI_MODEL=gemini-2.5-flash  # Optional, defaults to gemini-2.5-flash
   ```

## Usage

The script is automatically called by the Node.js backend when a complaint is submitted. It can also be run manually:

```bash
python categorization_and_priority_set.py --title "No water in hostel" --body "G-block bathroom taps are dry since morning"
```

## Output

The script outputs JSON to stdout:
```json
{"committee": "Hostel Management", "priority": "High"}
```

It also saves the same JSON to `./out/complaint_<timestamp>.json` for logging purposes.

