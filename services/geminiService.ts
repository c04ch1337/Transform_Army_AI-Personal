import { GoogleGenAI, Type } from "@google/genai";
import { AgentManifest, AgentTeamManifest, OrchestratorManifest, MissionStep } from '../types';

// Per instructions, API key must be from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const missionPlanSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      agent: {
        type: Type.STRING,
        description: 'The name of the agent assigned to this task.',
      },
      task: {
        type: Type.STRING,
        description: 'A clear, concise, and actionable task for the assigned agent.',
      },
      thought: {
        type: Type.STRING,
        description: 'A brief, step-by-step thought process explaining why this agent was chosen for this specific task and how it fits into the overall mission plan.',
      },
    },
    required: ["agent", "task", "thought"],
  },
};

export const generateMissionPlan = async (
  objective: string,
  team: AgentTeamManifest,
  teamAgents: AgentManifest[],
  orchestrator: OrchestratorManifest,
  industry: string,
  modelName: string,
  targetAudience: string,
  kpis: string,
  desiredOutcomes: string
): Promise<MissionStep[]> => {
  const teamCapabilities = teamAgents.map(agent => 
    `- Agent: ${agent.name}\n  Description: ${agent.description}\n  Tools: ${agent.tools.length > 0 ? agent.tools.map(t => t.name).join(', ') : 'None'}`
  ).join('\n');

  const prompt = `
    You are ${orchestrator.name}, version ${orchestrator.version}.
    Your Doctrine: ${orchestrator.teamDoctrine}

    Mission Details:
    - User Objective: "${objective}"
    - Industry Focus: ${industry}
    - Target Audience: ${targetAudience}
    - Key Performance Indicators (KPIs): ${kpis}
    - Desired Outcomes: ${desiredOutcomes}
    - Deployed Team: ${team.name} (${team.description})

    Available Team Members and Capabilities:
    ${teamCapabilities}

    Your task is to generate a mission plan based on your doctrine. The plan must be a JSON array of steps. Each step must assign a task to the most suitable agent from the available team. Ensure the agent names in your plan exactly match one of the names from the "Available Team Members" list.

    Generate the plan now.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: missionPlanSchema,
        temperature: 0.1,
      },
    });

    // Fix: Correctly extract text from the response.
    const jsonText = response.text.trim();
    const plan = JSON.parse(jsonText) as MissionStep[];
    
    // Validate the plan to ensure agents exist
    const validAgentNames = teamAgents.map(a => a.name);
    for (const step of plan) {
      if (!validAgentNames.includes(step.agent)) {
        console.warn(`Generated plan contains an invalid agent name: ${step.agent}. Trying to correct it.`);
        // Simple correction attempt, find the closest match.
        const closestMatch = validAgentNames.find(name => name.toLowerCase().includes(step.agent.toLowerCase()) || step.agent.toLowerCase().includes(name.toLowerCase()));
        if (closestMatch) {
            console.warn(`Corrected '${step.agent}' to '${closestMatch}'.`);
            step.agent = closestMatch;
        } else {
            throw new Error(`Generated plan contains an unknown agent: ${step.agent}. Known agents are: ${validAgentNames.join(', ')}`);
        }
      }
    }

    return plan;
  } catch (error) {
    console.error("Error generating mission plan with Gemini:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("The orchestrator failed to generate a valid JSON plan. Please try rephrasing your objective.");
    }
    throw new Error("Failed to communicate with the orchestrator AI. Please check your API key and network connection.");
  }
};

export async function* generateAgentThoughtStream(
  agent: AgentManifest,
  task: string,
  objective: string,
  modelName: string
): AsyncGenerator<string> {
  const prompt = `
    You are the AI agent "${agent.name}".
    Your Persona: ${agent.prompts.system}
    The overall mission objective is: "${objective}"
    Your current assigned task is: "${task}"

    Think step-by-step about how you will accomplish this task. Your thought process should be concise, professional, and reflect your persona. Speak in the first person. Do not repeat the task description or your persona. Just start thinking.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    for await (const chunk of response) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error generating agent thought stream:", error);
    yield "[ERROR: Could not generate thought process.]";
  }
}