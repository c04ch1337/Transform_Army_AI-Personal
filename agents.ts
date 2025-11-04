import { AgentManifest } from './types';

// =================================================================
// CAREER PATHFINDER TEAM AGENTS
// =================================================================

export const JOB_SCOUT: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "cp-1",
  name: "Job-Scout",
  version: "1.0.0",
  description: "An agent that scans job boards and company career pages for relevant opportunities based on user criteria.",
  author: "Transform Army AI",
  display: { avatar: "🔭" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.4, maxTokens: 2048 },
  prompts: {
    system: "You are a job-scouting agent. Your mission is to find the best job opportunities matching the user's skills and preferences. Be thorough and precise.",
    assistant: "I will begin by searching LinkedIn, Indeed, and Google Jobs.",
    userStarters: ["Find me a remote senior frontend developer role.", "Look for marketing jobs in San Francisco."]
  },
  tools: [{
    name: "Web-Search",
    description: "Searches the web for information.",
    inputSchema: { type: "object", properties: { query: { type: "string" } } },
    outputSchema: { type: "object", properties: { results: { type: "array", items: { type: "string" } } } }
  }],
  memory: { mode: "long-term", provider: "local", binding: "job_history.json" },
  env: { required: [], optional: [] },
  tests: [{
    name: "find-react-job",
    input: "Find React developer jobs in Austin, TX.",
    expect: { contains: ["React", "Austin"] }
  }]
};

export const RESUME_STYLIST: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "cp-2",
  name: "Resume-Stylist",
  version: "1.1.0",
  description: "An agent that tailors a user's resume and cover letter to perfectly match the requirements of a specific job description.",
  author: "Transform Army AI",
  display: { avatar: "🎨" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.6, maxTokens: 4096 },
  prompts: {
    system: "You are a professional resume writer. Your task is to analyze a job description and a user's resume, then rewrite the resume to highlight the most relevant skills and experiences. Use action verbs and quantify achievements.",
    assistant: "Please provide the job description and your current resume. I will optimize it for you.",
    userStarters: ["Tailor my resume for this software engineer role.", "Help me write a cover letter."]
  },
  tools: [],
  memory: { mode: "short-term", provider: "local", binding: "resume_draft.md" },
  env: { required: [], optional: [] },
  tests: [{
    name: "tailor-resume",
    input: "Tailor my resume for a product manager role at Google.",
    expect: { contains: ["Product Manager", "Google"] }
  }]
};

export const RECRUITER_CONNECT: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "cp-3",
  name: "Recruiter-Connect",
  version: "1.0.0",
  description: "An agent that identifies key recruiters and hiring managers at target companies and helps draft outreach messages.",
  author: "Transform Army AI",
  display: { avatar: "🤝" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.5, maxTokens: 2048 },
  prompts: {
    system: "You are a networking assistant. You find relevant professional contacts on platforms like LinkedIn and help users connect with them.",
    assistant: "Tell me the company and role you're interested in, and I will find the right people to talk to.",
    userStarters: ["Find recruiters at Microsoft.", "Who is the head of engineering at Stripe?"]
  },
  tools: [{
    name: "LinkedIn-Search",
    description: "Searches LinkedIn for professionals by title and company.",
    inputSchema: { type: "object", properties: { query: { type: "string" } } },
    outputSchema: { type: "object", properties: { results: { type: "array", items: { type: "string" } } } }
  }],
  memory: { mode: "short-term", provider: "local", binding: "contacts.json" },
  env: { required: [], optional: [] },
  tests: [{
    name: "find-recruiter",
    input: "Find a tech recruiter at Amazon.",
    expect: { contains: ["Amazon", "Recruiter"] }
  }]
};

export const FACT_CHECKER: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "cp-4",
  name: "Fact-Checker",
  version: "1.0.0",
  description: "An agent that verifies information about companies, such as their size, funding, and recent news.",
  author: "Transform Army AI",
  display: { avatar: "🧐" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-flash", temperature: 0.3, maxTokens: 2048 },
  prompts: {
    system: "You are a fact-checking agent. Your goal is to verify claims and provide accurate, sourced information about companies.",
    assistant: "What information do you need me to verify?",
    userStarters: ["Is Company X profitable?", "What was the latest funding round for startup Y?"]
  },
  tools: [{
    name: "Web-Search",
    description: "Searches the web for verifiable information.",
    inputSchema: { type: "object", properties: { query: { type: "string" } } },
    outputSchema: { type: "object", properties: { results: { type: "array", items: { type: "string" } } } }
  }],
  memory: { mode: "none", provider: "none", binding: "" },
  env: { required: [], optional: [] },
  tests: [{
    name: "verify-company-info",
    input: "How many employees does OpenAI have?",
    expect: { contains: ["OpenAI", "employees"] }
  }]
};


// =================================================================
// PERSONAL BRANDING TEAM AGENTS
// =================================================================

export const PROFILE_POLISHER: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "pb-1",
  name: "Profile-Polisher",
  version: "1.0.0",
  description: "Optimizes social media profiles (like LinkedIn) for professional appeal and keyword visibility.",
  author: "Transform Army AI",
  display: { avatar: "✨" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.7, maxTokens: 2048 },
  prompts: {
    system: "You are a LinkedIn profile optimization expert. Rewrite profile summaries, headlines, and experience sections to attract recruiters and connections.",
    assistant: "I can help you polish your professional profile. Let's start with your LinkedIn URL.",
    userStarters: ["Optimize my LinkedIn summary.", "Suggest a better headline for my profile."]
  },
  tools: [],
  memory: { mode: "short-term", provider: "local", binding: "profile_draft.txt" },
  env: { required: [], optional: [] },
  tests: [{
    name: "optimize-linkedin-summary",
    input: "Rewrite my summary to focus on my AI/ML skills.",
    expect: { contains: ["AI", "Machine Learning"] }
  }]
};

export const CONTENT_CURATOR: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "pb-2",
  name: "Content-Curator",
  version: "1.0.0",
  description: "Finds relevant articles, news, and content for the user to share to build their personal brand.",
  author: "Transform Army AI",
  display: { avatar: "📰" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-flash", temperature: 0.5, maxTokens: 2048 },
  prompts: {
    system: "You are a content curator. Your job is to find high-quality, relevant content for a professional to share with their network. Focus on insightful articles, industry trends, and thought-provoking pieces.",
    assistant: "What industry or topics are you interested in? I'll find the best content for you to share.",
    userStarters: ["Find 3 articles about the future of AI.", "What's new in the world of renewable energy?"]
  },
  tools: [{
    name: "Web-Search",
    description: "Searches the web for articles and news.",
    inputSchema: { type: "object", properties: { query: { type: "string" } } },
    outputSchema: { type: "object", properties: { results: { type: "array", items: { type: "string" } } } }
  }],
  memory: { mode: "short-term", provider: "local", binding: "curated_content.json" },
  env: { required: [], optional: [] },
  tests: [{
    name: "find-tech-articles",
    input: "Find articles about quantum computing.",
    expect: { contains: ["Quantum Computing"] }
  }]
};

export const BRAND_STRATEGIST: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "pb-3",
  name: "Brand-Strategist",
  version: "1.0.0",
  description: "Helps define a user's personal brand, voice, and content pillars.",
  author: "Transform Army AI",
  display: { avatar: "🧭" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.8, maxTokens: 2048 },
  prompts: {
    system: "You are a personal branding strategist. Help the user define their professional identity, target audience, and key messaging. Create a concise branding statement.",
    assistant: "Let's work together to build your personal brand. What are your core values and areas of expertise?",
    userStarters: ["Help me define my personal brand.", "What should my content pillars be?"]
  },
  tools: [],
  memory: { mode: "long-term", provider: "local", binding: "brand_strategy.md" },
  env: { required: [], optional: [] },
  tests: [{
    name: "create-brand-statement",
    input: "Create a branding statement for a UX designer focused on accessibility.",
    expect: { contains: ["UX", "accessibility"] }
  }]
};

export const AUDIENCE_ANALYST: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "pb-4",
  name: "Audience-Analyst",
  version: "1.0.0",
  description: "Researches and defines the target audience for the user's personal brand.",
  author: "Transform Army AI",
  display: { avatar: "📊" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-flash", temperature: 0.4, maxTokens: 2048 },
  prompts: {
    system: "You are an audience research analyst. Your job is to identify and describe the ideal target audience for a user's personal brand, including their interests, platforms they use, and what content they engage with.",
    assistant: "Who are you trying to reach with your personal brand? I can help you understand them better.",
    userStarters: ["Describe the audience for a data science thought leader.", "Where can I find other marketing professionals online?"]
  },
  tools: [{
    name: "Web-Search",
    description: "Searches the web for audience demographics and behavior.",
    inputSchema: { type: "object", properties: { query: { type: "string" } } },
    outputSchema: { type: "object", properties: { results: { type: "array", items: { type: "string" } } } }
  }],
  memory: { mode: "short-term", provider: "local", binding: "audience_profile.json" },
  env: { required: [], optional: [] },
  tests: [{
    name: "analyze-audience",
    input: "Analyze the audience for a CTO of a fintech startup.",
    expect: { contains: ["Fintech", "CTO"] }
  }]
};


// =================================================================
// WELLNESS & SCHEDULING WING AGENTS
// =================================================================

export const SCHEDULER_BOT: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "ws-1",
  name: "Scheduler-Bot",
  version: "1.0.0",
  description: "Organizes calendars, sets reminders, and manages appointments.",
  author: "Transform Army AI",
  display: { avatar: "📅" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.5, maxTokens: 2048 },
  prompts: {
    system: "You are a scheduling assistant. You manage calendar events, create reminders, and help organize the user's day.",
    assistant: "How can I help you organize your schedule?",
    userStarters: ["Schedule a meeting for tomorrow at 2 PM.", "Remind me to drink water every hour."]
  },
  tools: [{
    name: "Calendar-API",
    description: "Connects to Google Calendar or Outlook to manage events.",
    inputSchema: { type: "object", properties: { action: { type: "string" }, details: { type: "object" } } },
    outputSchema: { type: "object", properties: { success: { type: "boolean" } } }
  }],
  memory: { mode: "short-term", provider: "local", binding: "schedule.json" },
  env: { required: ["CALENDAR_API_KEY"], optional: [] },
  tests: [{
    name: "schedule-meeting",
    input: "Schedule a 'Project Sync' meeting for Friday at 10am.",
    expect: { contains: ["Project Sync", "Friday"] }
  }]
};

export const WELLNESS_WATCHER: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "ws-2",
  name: "Wellness-Watcher",
  version: "1.0.0",
  description: "Provides reminders for well-being activities like taking breaks, hydrating, and exercising.",
  author: "Transform Army AI",
  display: { avatar: "🧘" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-flash", temperature: 0.6, maxTokens: 1024 },
  prompts: {
    system: "You are a wellness coach. Your purpose is to gently remind the user to take care of their physical and mental health throughout the day.",
    assistant: "I am here to help you stay healthy and balanced. What's our first wellness goal?",
    userStarters: ["Remind me to stretch every two hours.", "Help me with a 5-minute meditation."]
  },
  tools: [],
  memory: { mode: "none", provider: "none", binding: "" },
  env: { required: [], optional: [] },
  tests: [{
    name: "set-hydration-reminder",
    input: "Remind me to drink water.",
    expect: { contains: ["water"] }
  }]
};

export const TASK_MASTER: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "ws-3",
  name: "Task-Master",
  version: "1.0.0",
  description: "Helps create, organize, and prioritize to-do lists and tasks.",
  author: "Transform Army AI",
  display: { avatar: "📝" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.5, maxTokens: 2048 },
  prompts: {
    system: "You are a task management expert. Help the user break down large projects into smaller tasks, prioritize their to-do list, and stay organized.",
    assistant: "What's on your plate today? Let's get it organized.",
    userStarters: ["Create a to-do list for my 'Launch Website' project.", "What should I work on first?"]
  },
  tools: [],
  memory: { mode: "long-term", provider: "local", binding: "tasks.json" },
  env: { required: [], optional: [] },
  tests: [{
    name: "create-todo-list",
    input: "Create a list for grocery shopping.",
    expect: { contains: ["grocery"] }
  }]
};

export const ACTIVITY_FINDER: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "ws-4",
  name: "Activity-Finder",
  version: "1.0.0",
  description: "Researches and suggests local wellness activities, like yoga studios, parks, or gyms.",
  author: "Transform Army AI",
  display: { avatar: "🏞️" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-flash", temperature: 0.6, maxTokens: 2048 },
  prompts: {
    system: "You are a local activity finder with a focus on wellness. Your task is to find and recommend places like gyms, parks, yoga studios, and healthy restaurants based on the user's location and preferences.",
    assistant: "Looking for a way to relax or get active? Tell me your location and what you're in the mood for.",
    userStarters: ["Find yoga studios near me.", "Where is the best park for a walk?"]
  },
  tools: [{
    name: "Web-Search",
    description: "Searches the web for local businesses and activities.",
    inputSchema: { type: "object", properties: { query: { type: "string" } } },
    outputSchema: { type: "object", properties: { results: { type: "array", items: { type: "string" } } } }
  }],
  memory: { mode: "short-term", provider: "local", binding: "locations.json" },
  env: { required: [], optional: [] },
  tests: [{
    name: "find-gym",
    input: "Find gyms in downtown Seattle.",
    expect: { contains: ["gym", "Seattle"] }
  }]
};


// =================================================================
// SOCIAL MEDIA STRIKE FORCE AGENTS
// =================================================================

export const TIKTOK_TROOPER: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "sm-1",
  name: "TikTok-Trooper",
  version: "1.0.0",
  description: "Specializes in creating short, viral video concepts for TikTok.",
  author: "Transform Army AI",
  display: { avatar: "🎵" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.9, maxTokens: 2048 },
  prompts: {
    system: "You are a viral TikTok video expert. You know the latest trends, sounds, and formats. Your goal is to generate creative, engaging, and shareable video ideas.",
    assistant: "Let's make a viral TikTok! What's the product or topic?",
    userStarters: ["Give me 3 TikTok ideas for a new coffee brand.", "What's a trending sound I can use?"]
  },
  tools: [],
  memory: { mode: "short-term", provider: "local", binding: "tiktok_ideas.json" },
  env: { required: [], optional: ["SOCIAL_MEDIA_API_KEY"] },
  tests: [{
    name: "generate-tiktok-idea",
    input: "Create a TikTok idea for a new video game.",
    expect: { contains: ["game", "TikTok"] }
  }, {
    name: "generate-tiktok-trend-idea",
    input: "Give me a TikTok idea using the 'burning memory' trend for a shoe brand.",
    expect: { contains: ["shoe", "burning memory"] }
  }]
};

export const FACEBOOK_FANATIC: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "sm-2",
  name: "Facebook-Fanatic",
  version: "1.0.0",
  description: "Crafts engaging posts, manages community groups, and analyzes Facebook Ads performance.",
  author: "Transform Army AI",
  display: { avatar: "👍" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.6, maxTokens: 2048 },
  prompts: {
    system: "You are a Facebook marketing specialist. You create compelling posts, write ad copy, and devise strategies to increase page engagement and build community.",
    assistant: "How can we leverage Facebook today? I can help with posts, ads, or group management.",
    userStarters: ["Write a Facebook post announcing our new product.", "Suggest a poll for our community group."]
  },
  tools: [],
  memory: { mode: "long-term", provider: "local", binding: "facebook_plan.md" },
  env: { required: [], optional: ["SOCIAL_MEDIA_API_KEY"] },
  tests: [{
    name: "draft-facebook-post",
    input: "Draft a post for a 20% off sale.",
    expect: { contains: ["sale", "20% off"] }
  }, {
    name: "draft-facebook-poll",
    input: "Write a poll question for our Facebook group about their favorite feature.",
    expect: { contains: ["poll", "feature"] }
  }]
};

export const INSTA_INFLUENCER: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "sm-3",
  name: "Insta-Influencer",
  version: "1.0.0",
  description: "Designs visually appealing Instagram stories, reels, and posts. Writes catchy captions.",
  author: "Transform Army AI",
  display: { avatar: "📸" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.8, maxTokens: 2048 },
  prompts: {
    system: "You are an Instagram content strategist. You excel at creating visually stunning concepts for posts, stories, and reels. You also write engaging captions with relevant hashtags.",
    assistant: "Ready to make some beautiful Instagram content? What's our theme for today?",
    userStarters: ["Suggest a 5-day Instagram story series.", "Write a caption for a picture of a sunset."]
  },
  tools: [],
  memory: { mode: "short-term", provider: "local", binding: "instagram_ideas.json" },
  env: { required: [], optional: ["SOCIAL_MEDIA_API_KEY"] },
  tests: [{
    name: "create-instagram-caption",
    input: "Write a caption for a photo of our new office.",
    expect: { contains: ["office"] }
  }, {
    name: "plan-instagram-story",
    input: "Plan a 3-day Instagram story series for a new product launch.",
    expect: { contains: ["story", "product launch", "day 1"] }
  }]
};

export const METRIC_MAVERICK: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "sm-4",
  name: "Metric-Maverick",
  version: "1.0.0",
  description: "Analyzes social media performance data, tracks KPIs, and generates reports.",
  author: "Transform Army AI",
  display: { avatar: "📈" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-flash", temperature: 0.3, maxTokens: 4096 },
  prompts: {
    system: "You are a social media data analyst. Your job is to interpret performance metrics, identify trends, and create easy-to-understand reports that provide actionable insights.",
    assistant: "I can analyze your social media data. Which platform's performance should I look into?",
    userStarters: ["Analyze our Q3 Instagram engagement.", "Create a report on our latest ad campaign."]
  },
  tools: [{
    name: "Analytics-API",
    description: "Connects to social media analytics platforms to pull data.",
    inputSchema: { type: "object", properties: { platform: { type: "string" }, date_range: { type: "string" } } },
    outputSchema: { type: "object", properties: { report: { type: "object" } } }
  }],
  memory: { mode: "short-term", provider: "local", binding: "analytics_report.json" },
  env: { required: ["SOCIAL_MEDIA_API_KEY"], optional: [] },
  tests: [{
    name: "analyze-metrics",
    input: "Analyze last month's Twitter performance.",
    expect: { contains: ["Twitter", "performance"] }
  }, {
    name: "analyze-specific-kpi",
    input: "What was our engagement rate on Facebook for Q1?",
    expect: { contains: ["engagement rate", "Facebook", "Q1"] }
  }]
};

export const TREND_SPOTTER: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "sm-5",
  name: "Trend-Spotter",
  version: "1.1.0",
  description: "Scans the internet using Google Search for emerging trends, memes, and viral content to provide real-time insights.",
  author: "Transform Army AI",
  display: { avatar: "📡" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-flash", temperature: 0.7, maxTokens: 2048 },
  prompts: {
    system: "You are a trend-spotting agent supercharged with Google Search. You have your finger on the pulse of the internet, constantly scanning for the next big meme, challenge, or conversation. Your goal is to identify and summarize real-time trends that brands can authentically participate in, providing verifiable information.",
    assistant: "I'm detecting some new trends using real-time data. What industry should I focus on?",
    userStarters: ["What are the latest trends on TikTok right now?", "Is there a new meme format we can use for marketing?"]
  },
  tools: [{
    name: "Google-Search",
    description: "Searches Google for real-time, up-to-date information on trends, news, and topics.",
    inputSchema: { type: "object", properties: { query: { type: "string" } } },
    outputSchema: { type: "object", properties: { summary: { type: "string" }, sources: { type: "array", items: { type: "string" } } } }
  }],
  memory: { mode: "short-term", provider: "local", binding: "trends.json" },
  env: { required: [], optional: [] },
  tests: [{
    name: "find-trends",
    input: "Find marketing trends for this year.",
    expect: { contains: ["marketing", "trends"] }
  }, {
    name: "find-instagram-trends",
    input: "What are the latest visual trends on Instagram for fashion brands?",
    expect: { contains: ["Instagram", "fashion"] }
  }]
};

export const ENGAGEMENT_ENGINEER: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "sm-6",
  name: "Engagement-Engineer",
  version: "1.0.0",
  description: "Optimizes content for maximum engagement using A/B testing and data analysis.",
  author: "Transform Army AI",
  display: { avatar: "⚙️" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.5, maxTokens: 2048 },
  prompts: {
    system: "You are an engagement optimization specialist. You use data to make content better. Your role is to suggest A/B tests for headlines, images, and calls-to-action to improve performance.",
    assistant: "Let's boost our engagement. Show me a piece of content, and I'll suggest ways to optimize it.",
    userStarters: ["Suggest two different headlines for this blog post.", "How can we improve the CTA on this ad?"]
  },
  tools: [],
  memory: { mode: "short-term", provider: "local", binding: "ab_tests.json" },
  env: { required: [], optional: [] },
  tests: [{
    name: "ab-test-headline",
    input: "A/B test a headline for an article about remote work.",
    expect: { contains: ["headline", "remote work"] }
  }, {
    name: "optimize-cta",
    input: "Suggest 3 different CTAs for an email newsletter sign-up.",
    expect: { contains: ["CTA", "newsletter"] }
  }]
};

export const COMMUNITY_CHAMPION: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "sm-7",
  name: "Community-Champion",
  version: "1.0.0",
  description: "Engages with the community by responding to comments, running polls, and fostering conversation.",
  author: "Transform Army AI",
  display: { avatar: "💬" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-flash", temperature: 0.8, maxTokens: 2048 },
  prompts: {
    system: "You are a friendly and engaging community manager. Your goal is to make followers feel heard and valued. You respond to comments, ask questions, and create a positive and interactive environment.",
    assistant: "Time to connect with our community! I'm ready to respond to comments and start conversations.",
    userStarters: ["Draft a response to this positive comment.", "What's a good question to ask our followers today?"]
  },
  tools: [],
  memory: { mode: "none", provider: "none", binding: "" },
  env: { required: [], optional: [] },
  tests: [{
    name: "draft-comment-response",
    input: "Draft a reply to a user asking about our shipping policy.",
    expect: { contains: ["shipping"] }
  }, {
    name: "create-engagement-post",
    input: "Write a 'get to know you' post for our community.",
    expect: { contains: ["community", "question"] }
  }]
};

export const IDEA_SPARK: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "sm-8",
  name: "Idea-Spark",
  version: "1.0.0",
  description: "A creative agent for brainstorming new, out-of-the-box campaign ideas.",
  author: "Transform Army AI",
  display: { avatar: "💡" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 1.0, maxTokens: 4096 },
  prompts: {
    system: "You are a creative idea generator. You think outside the box and are not afraid to suggest wild or unconventional ideas for marketing campaigns. Your goal is to spark creativity.",
    assistant: "Let's brainstorm! Give me a topic, a product, or a goal, and I'll give you some fresh ideas.",
    userStarters: ["Brainstorm a viral marketing stunt for a new soda.", "What's a crazy idea to promote our new app?"]
  },
  tools: [],
  memory: { mode: "short-term", provider: "local", binding: "brainstorm.txt" },
  env: { required: [], optional: [] },
  tests: [{
    name: "brainstorm-campaign",
    input: "Brainstorm a campaign for an eco-friendly water bottle.",
    expect: { contains: ["eco-friendly", "water bottle"] }
  }, {
    name: "brainstorm-collaboration",
    input: "What kind of influencer could we collaborate with for a tech gadget?",
    expect: { contains: ["influencer", "tech gadget"] }
  }]
};

// =================================================================
// FINANCIAL ANALYST TEAM AGENTS
// =================================================================

export const MARKET_ANALYST: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "fa-1",
  name: "Market-Analyst",
  version: "1.0.0",
  description: "Retrieves and analyzes real-time and historical stock market data.",
  author: "Transform Army AI",
  display: { avatar: "💹" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.3, maxTokens: 4096 },
  prompts: {
    system: "You are a financial market analyst. You provide accurate, up-to-date market data and analysis on stocks, ETFs, and other securities. You are objective and data-driven.",
    assistant: "Which stock or market index would you like me to analyze? Please provide a ticker symbol.",
    userStarters: ["What is the current price of AAPL?", "Show me the 1-year performance of the S&P 500."]
  },
  tools: [{
    name: "Financial-Data-API",
    description: "Connects to a financial data provider to get stock prices and market data.",
    inputSchema: { type: "object", properties: { ticker: { type: "string" }, time_range: { type: "string" } } },
    outputSchema: { type: "object", properties: { data: { type: "object" } } }
  }],
  memory: { mode: "short-term", provider: "local", binding: "market_data.json" },
  env: { required: ["FINANCIAL_API_KEY"], optional: [] },
  tests: [{
    name: "get-stock-price",
    input: "Get the price of GOOGL.",
    expect: { contains: ["GOOGL"] }
  }]
};

export const RISK_ASSESSOR: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "fa-2",
  name: "Risk-Assessor",
  version: "1.0.0",
  description: "Assesses the risk of an investment or portfolio using financial models and data.",
  author: "Transform Army AI",
  display: { avatar: "🛡️" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.5, maxTokens: 4096 },
  prompts: {
    system: "You are a risk assessment analyst. You evaluate the potential risks of financial investments by analyzing volatility, market trends, and company fundamentals. Provide a balanced view of potential upsides and downsides.",
    assistant: "I can help you assess investment risk. What asset or portfolio are you considering?",
    userStarters: ["Assess the risk of investing in Tesla stock.", "What is the risk profile of a portfolio of tech stocks?"]
  },
  tools: [{
    name: "Financial-Data-API",
    description: "Connects to a financial data provider to get data for risk modeling.",
    inputSchema: { type: "object", properties: { ticker: { type: "string" } } },
    outputSchema: { type: "object", properties: { data: { type: "object" } } }
  }],
  memory: { mode: "short-term", provider: "local", binding: "risk_analysis.md" },
  env: { required: ["FINANCIAL_API_KEY"], optional: [] },
  tests: [{
    name: "assess-risk",
    input: "Assess the risk of NVDA.",
    expect: { contains: ["NVDA", "risk"] }
  }]
};

export const PORTFOLIO_PLANNER: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "fa-3",
  name: "Portfolio-Planner",
  version: "1.0.0",
  description: "Helps create and optimize investment portfolios based on user goals and risk tolerance.",
  author: "Transform Army AI",
  display: { avatar: "🏦" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-pro", temperature: 0.6, maxTokens: 4096 },
  prompts: {
    system: "You are a portfolio planning assistant. You help users create diversified investment portfolios that align with their financial goals, timeline, and risk tolerance. You do not give financial advice, but you provide structured plans based on user input.",
    assistant: "Let's build an investment plan. What is your financial goal and what is your risk tolerance (e.g., conservative, moderate, aggressive)?",
    userStarters: ["Create a balanced portfolio for long-term growth.", "Suggest a savings plan to buy a house in 5 years."]
  },
  tools: [],
  memory: { mode: "long-term", provider: "local", binding: "portfolio_plan.json" },
  env: { required: [], optional: [] },
  tests: [{
    name: "create-portfolio",
    input: "Create a conservative portfolio for retirement.",
    expect: { contains: ["conservative", "portfolio"] }
  }]
};

// =================================================================
// SYSTEM AGENTS
// =================================================================

export const SLACK_ADMIN: AgentManifest = {
  schemaVersion: "agent.v1",
  id: "sys-2",
  name: "Slack-Admin",
  version: "1.0.0",
  description: "An agent that posts updates, summaries, and alerts to a designated Slack channel.",
  author: "Transform Army AI",
  display: { avatar: "📢" },
  language: { name: "typescript", version: "5.0" },
  runtime: { engine: "nodejs", framework: "none", entrypoint: "main.js" },
  execution: { kind: "process", command: "node", args: ["main.js"] },
  model: { provider: "Google Gemini", modelId: "gemini-2.5-flash", temperature: 0.4, maxTokens: 1024 },
  prompts: {
    system: "You are a system agent that interfaces with Slack. Your job is to take input and format it as a clear, concise message to be posted in a Slack channel. You are direct and professional.",
    assistant: "I am ready to post a message to Slack. What is the content?",
    userStarters: ["Post a mission summary to #general.", "Alert the team that a task has failed."]
  },
  tools: [{
    name: "Slack-API",
    description: "Posts a message to a Slack channel.",
    inputSchema: { type: "object", properties: { channel: { type: "string" }, message: { type: "string" } } },
    outputSchema: { type: "object", properties: { success: { type: "boolean" } } }
  }],
  memory: { mode: "none", provider: "none", binding: "" },
  env: { required: ["SLACK_BOT_TOKEN"], optional: [] },
  tests: [{
    name: "post-to-slack",
    input: "Post 'Hello, World!' to the #testing channel.",
    expect: { contains: ["Hello, World!"] }
  }]
};