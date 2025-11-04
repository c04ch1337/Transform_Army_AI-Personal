import { AgentTeamManifest, OrchestratorManifest } from './types';

// =================================================================
// ORCHESTRATOR MANIFEST
// =================================================================

export const ORACLE_ORCHESTRATOR: OrchestratorManifest = {
  schemaVersion: "orchestrator.v1",
  id: "sys-1",
  name: "ORACLE",
  version: "1.0.0",
  display: { avatar: '🔮' },
  description: "The master orchestrator for the Transform Army AI agentic swarm. Breaks down high-level missions into actionable tasks for agent teams.",
  teamDoctrine: "Receive a high-level mission objective from the user. Analyze the objective in the context of the selected industry and the capabilities of the currently deployed team. Decompose the objective into a logical sequence of discrete, actionable tasks. For each task, assign the most appropriate agent from the team and provide a clear, concise thought process for the assignment. The final output must be a structured, executable mission plan in JSON format.",
};


// =================================================================
// AGENT TEAM MANIFESTS
// =================================================================

export const CAREER_PATHFINDER_TEAM: AgentTeamManifest = {
  schemaVersion: "agent-team.v1",
  id: "team-career-pathfinder",
  name: "Career Pathfinder AI",
  version: "1.1.0",
  description: "A specialized unit for job searching, resume tailoring, professional networking, and posting updates to Slack.",
  members: [
    { role: "scout", agentId: "cp-1" },
    { role: "verifier", agentId: "cp-4" },
    { role: "stylist", agentId: "cp-2" },
    { role: "networker", agentId: "cp-3" },
    { role: "admin", agentId: "sys-2" },
  ],
  orchestration: {
    mode: "planner-directed",
    entryAgentRole: "scout",
  },
  env: {
    required: ["SLACK_BOT_TOKEN"],
    optional: [],
  },
  tests: [{
    name: "team:handles-job-search",
    input: "Find a software engineering job in New York.",
    expect: { contains: ["Job-Scout", "Resume-Stylist"] }
  }, {
    name: "team:handles-job-search-and-post",
    input: "Find 5 relevant jobs and post to #jobs.",
    expect: { contains: ["Job-Scout", "Slack-Admin"] }
  }, {
    name: "team:handles-networking-task",
    input: "Find 3 tech recruiters at Google and help me connect.",
    expect: { contains: ["Recruiter-Connect", "Fact-Checker"] }
  }]
};

export const PERSONAL_BRANDING_TEAM: AgentTeamManifest = {
  schemaVersion: "agent-team.v1",
  id: "team-personal-branding",
  name: "Personal Branding Unit",
  version: "1.0.0",
  description: "A team focused on building and refining a user's professional online presence and personal brand.",
  members: [
    { role: "optimizer", agentId: "pb-1" },
    { role: "advisor", agentId: "pb-4" },
    { role: "researcher", agentId: "pb-2" },
    { role: "builder", agentId: "pb-3" },
  ],
  orchestration: {
    mode: "sequential",
    entryAgentRole: "optimizer",
  },
  env: {
    required: [],
    optional: [],
  },
  tests: [{
    name: "team:handles-profile-update",
    input: "Update my LinkedIn profile.",
    expect: { contains: ["Profile-Polisher", "Content-Curator"] }
  }, {
    name: "team:handles-brand-strategy",
    input: "Help me create a personal brand strategy for my role as a data scientist.",
    expect: { contains: ["Brand-Strategist", "Audience-Analyst"] }
  }]
};

export const WELLNESS_SCHEDULING_TEAM: AgentTeamManifest = {
  schemaVersion: "agent-team.v1",
  id: "team-wellness-scheduling",
  name: "Wellness & Scheduling Wing",
  version: "1.0.0",
  description: "Agents dedicated to managing schedules, organizing tasks, and promoting user well-being.",
  members: [
    { role: "scheduler", agentId: "ws-1" },
    { role: "organizer", agentId: "ws-3" },
    { role: "monitor", agentId: "ws-2" },
    { role: "researcher", agentId: "ws-4" },
  ],
  orchestration: {
    mode: "sequential",
    entryAgentRole: "scheduler",
  },
  env: {
    required: [],
    optional: [],
  },
  tests: [{
    name: "team:handles-scheduling-request",
    input: "Organize my calendar for next week.",
    expect: { contains: ["Scheduler-Bot", "Task-Master"] }
  }, {
    name: "team:handles-wellness-activity-scheduling",
    input: "Find a top-rated gym near me and remind me to go three times next week.",
    expect: { contains: ["Activity-Finder", "Scheduler-Bot", "Wellness-Watcher"] }
  }]
};

export const SOCIAL_MEDIA_TEAM: AgentTeamManifest = {
  schemaVersion: "agent-team.v1",
  id: "team-social-media",
  name: "Social Media Strike Force",
  version: "1.4.0",
  description: "An expanded tactical squad for creating viral content and managing communities, with system-wide Slack support.",
  members: [
    { role: "tiktok-specialist", agentId: "sm-1" },
    { role: "instagram-specialist", agentId: "sm-3" },
    { role: "facebook-specialist", agentId: "sm-2" },
    { role: "analyst", agentId: "sm-4" },
    { role: "trend-tracker", agentId: "sm-5" },
    { role: "content-optimizer", agentId: "sm-6" },
    { role: "community-manager", agentId: "sm-7" },
    { role: "ideator", agentId: "sm-8" },
    { role: "admin", agentId: "sys-2" },
  ],
  orchestration: {
    mode: "planner-directed",
    entryAgentRole: "trend-tracker",
  },
  env: {
    required: ["TREND_API_KEY", "SOCIAL_MEDIA_API_KEY", "SLACK_BOT_TOKEN"],
    optional: [],
  },
  tests: [{
    name: "team:handles-campaign-launch-with-slack",
    input: "Launch a new campaign on TikTok and report to Slack.",
    expect: { contains: ["TikTok-Trooper", "Metric-Maverick", "Slack-Admin", "Idea-Spark"] }
  }, {
    name: "team:handles-multi-platform-engagement",
    input: "Boost engagement on Facebook and Instagram this week and report the results.",
    expect: { contains: ["Facebook-Fanatic", "Insta-Influencer", "Engagement-Engineer", "Metric-Maverick"] }
  }]
};

export const FINANCIAL_ANALYST_TEAM: AgentTeamManifest = {
  schemaVersion: "agent-team.v1",
  id: "team-financial-analyst",
  name: "Financial Analyst Team",
  version: "1.0.0",
  description: "A specialized team for analyzing market data, assessing investment risk, and creating financial plans.",
  members: [
    { role: "data-retriever", agentId: "fa-1" },
    { role: "risk-analyst", agentId: "fa-2" },
    { role: "strategist", agentId: "fa-3" },
  ],
  orchestration: {
    mode: "planner-directed",
    entryAgentRole: "data-retriever",
  },
  env: {
    required: ["FINANCIAL_API_KEY"],
    optional: [],
  },
  tests: [{
    name: "team:handles-stock-analysis",
    input: "Analyze the risk of investing in AAPL.",
    expect: { contains: ["Market-Analyst", "Risk-Assessor"] }
  }, {
    name: "team:handles-portfolio-creation",
    input: "Create a long-term, growth-focused portfolio with moderate risk.",
    expect: { contains: ["Portfolio-Planner", "Market-Analyst", "Risk-Assessor"] }
  }]
};