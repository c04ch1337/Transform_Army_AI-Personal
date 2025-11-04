// A simplified representation of a JSON schema for tool inputs/outputs.
export interface ToolSchema {
  type: string;
  properties?: {
    [key: string]: ToolSchema & { description?: string };
  };
  items?: ToolSchema;
  required?: string[];
  description?: string;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: ToolSchema;
  outputSchema: ToolSchema;
  requiresAuth?: boolean;
  authVars?: string[];
}

export interface ImportMeta {
  source: string;
  sourceType: 'user-paste';
  timestamp: string;
}

export enum AgentStatus {
    STANDBY = 'STANDBY',
    DEPLOYED = 'DEPLOYED',
    PROCESSING = 'PROCESSING',
    TASK_COMPLETED = 'TASK_COMPLETED',
    ERROR = 'ERROR',
    COMPROMISED = 'COMPROMISED',
}

export enum AgentSubStatus {
    THINKING = 'THINKING',
    USING_TOOL = 'USING_TOOL',
}


// Represents the static, portable definition of an agent, following the ACoC standard.
export interface AgentManifest {
  schemaVersion: "agent.v1";
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  display: {
    avatar: string;
  };
  language: {
    name: string;
    version: string;
  };
  runtime: {
    engine: string;
    framework: string;
    entrypoint: string;
  };
  execution: {
    kind: string;
    command: string;
    args: string[];
  };
  model: {
    provider: string;
    modelId: string;
    temperature: number;
    maxTokens: number;
  };
  prompts: {
    system: string;
    assistant: string;
    userStarters: string[];
  };
  tools: Tool[];
  memory: {
    mode: string;
    provider: string;
    binding: string;
    notes?: string;
  };
  env: {
    required: string[];
    optional: string[];
  };
  tests: {
    name: string;
    input: string;
    expect: {
      contains: string[];
    };
  }[];
  policies?: {};
  training?: {
    allowPromptEdits?: boolean;
  };
  importMeta?: ImportMeta;
}


// Represents the dynamic, in-memory state of an agent during a mission.
export interface AgentRuntimeState {
  id: string;
  name: string;
  status: AgentStatus;
  subStatus?: AgentSubStatus | null;
  currentTask: string;
  currentThought?: string;
  manifest: AgentManifest;
}

// New manifest for defining a team of agents.
export interface AgentTeamManifest {
  schemaVersion: "agent-team.v1";
  id: string;
  name: string;
  displayName?: string;
  version: string;
  description: string;
  members: {
    role: string;
    agentId: string;
  }[];
  orchestration?: {
    mode: 'sequential' | 'parallel' | 'planner-directed';
    entryAgentRole: string;
  };
  sharedMemory?: AgentManifest['memory'];
  env?: AgentManifest['env'];
  tests?: {
    name: string;
    input: string;
    expect: {
      contains: string[];
    };
  }[];
  importMeta?: ImportMeta;
}

// New manifest for defining an orchestrator.
export interface OrchestratorManifest {
  schemaVersion: "orchestrator.v1";
  id: string;
  name: string;
  version: string;
  description: string;
  display?: {
    avatar: string;
  };
  teamDoctrine: string; // The high-level strategy for managing teams.
  agentTemplates?: AgentManifest[]; // Optional inline agent templates for dynamic creation.
  sharedMemory?: AgentManifest['memory'];
  env?: AgentManifest['env'];
}


export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: 'COMMAND' | 'STATUS' | 'COMMS' | 'ERROR' | 'INFO';
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'orchestrator';
    timestamp: string;
}

export interface SlackMessage {
    id: string;
    text: string;
    sender: 'user' | 'system-bot' | 'error-bot';
    timestamp: string;
}

export interface MissionStep {
  agent: string;
  task: string;
  thought: string;
}

export interface SharedMemoryValue {
    value: any;
    writtenBy: string; // agent name
    timestamp: string;
    citations?: string[];
}
export type SharedMemoryContents = Record<string, SharedMemoryValue>;