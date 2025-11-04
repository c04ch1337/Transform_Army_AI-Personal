import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AgentManifest, AgentTeamManifest, OrchestratorManifest, MissionStep, ChatMessage } from '../types';

// Per instructions, API key must be from process.env.API_KEY
const geminiAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

const generatePlanPrompt = (
    orchestrator: OrchestratorManifest,
    objective: string,
    industry: string,
    targetAudience: string,
    kpis: string,
    desiredOutcomes: string,
    team: AgentTeamManifest,
    teamCapabilities: string
) => `
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

const validatePlan = (plan: MissionStep[], teamAgents: AgentManifest[]) => {
    const validAgentNames = teamAgents.map(a => a.name);
    for (const step of plan) {
        if (!validAgentNames.includes(step.agent)) {
            console.warn(`Generated plan contains an invalid agent name: ${step.agent}. Trying to correct it.`);
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
}


export const generateMissionPlan = async (
  objective: string,
  team: AgentTeamManifest,
  teamAgents: AgentManifest[],
  orchestrator: OrchestratorManifest,
  industry: string,
  modelName: string,
  targetAudience: string,
  kpis: string,
  desiredOutcomes: string,
  selectedProvider: string,
  vaultValues: Record<string, string>
): Promise<MissionStep[]> => {
  const teamCapabilities = teamAgents.map(agent =>
    `- Agent: ${agent.name}\n  Description: ${agent.description}\n  Tools: ${agent.tools.length > 0 ? agent.tools.map(t => t.name).join(', ') : 'None'}`
  ).join('\n');

  const prompt = generatePlanPrompt(orchestrator, objective, industry, targetAudience, kpis, desiredOutcomes, team, teamCapabilities);

  try {
    let jsonText: string;

    if (selectedProvider === 'Google Gemini') {
        const response = await geminiAi.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: missionPlanSchema,
                temperature: 0.1,
            },
        });
        jsonText = response.text.trim();
    } else {
        const apiKey = vaultValues['OPENROUTER_API_KEY'];
        if (!apiKey) {
            throw new Error("OpenRouter API key is missing from the Secure Vault. Please add it to continue.");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.1,
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenRouter API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();
        jsonText = data.choices[0].message.content;
    }
    
    const plan = JSON.parse(jsonText) as MissionStep[];
    return validatePlan(plan, teamAgents);

  } catch (error) {
    console.error(`Error generating mission plan with ${selectedProvider}:`, error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("The orchestrator failed to generate a valid JSON plan. Please try rephrasing your objective.");
    }
    throw new Error(`Failed to communicate with the orchestrator AI (${selectedProvider}). Please check your API key and network connection.`);
  }
};

export async function* generateAgentThoughtStream(
  agent: AgentManifest,
  task: string,
  objective: string,
  modelName: string,
  selectedProvider: string,
  vaultValues: Record<string, string>
): AsyncGenerator<string> {
  const prompt = `
    You are the AI agent "${agent.name}".
    Your Persona: ${agent.prompts.system}
    The overall mission objective is: "${objective}"
    Your current assigned task is: "${task}"

    Think step-by-step about how you will accomplish this task. Your thought process should be concise, professional, and reflect your persona. Speak in the first person. Do not repeat the task description or your persona. Just start thinking.
  `;

  try {
    if (selectedProvider === 'Google Gemini') {
        const response = await geminiAi.models.generateContentStream({
            model: modelName,
            contents: prompt,
            config: {
                temperature: 0.3,
            },
        });

        for await (const chunk of response) {
            yield chunk.text;
        }
    } else {
        const apiKey = vaultValues['OPENROUTER_API_KEY'];
        if (!apiKey) {
            yield "[ERROR: OpenRouter API key is missing from the Secure Vault.]";
            return;
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: "user", content: prompt }],
                stream: true,
                temperature: 0.3,
            })
        });
        
        if (!response.ok || !response.body) {
             const errorBody = await response.text();
            throw new Error(`OpenRouter stream request failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.substring(6);
                    if (data.trim() === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.choices && parsed.choices[0].delta.content) {
                            yield parsed.choices[0].delta.content;
                        }
                    } catch (e) {
                        console.error("Failed to parse stream chunk:", data);
                    }
                }
            }
        }
    }
  } catch (error) {
    console.error(`Error generating agent thought stream with ${selectedProvider}:`, error);
    yield `[ERROR: Could not generate thought process via ${selectedProvider}.]`;
  }
}


export const executeGroundedAgentTask = async (
  agent: AgentManifest,
  task: string,
  objective: string,
  modelName: string,
  selectedProvider: string,
  vaultValues: Record<string, string>
): Promise<GenerateContentResponse> => {
    const prompt = `
        You are the AI agent "${agent.name}".
        Your Persona: ${agent.prompts.system}
        The overall mission objective is: "${objective}"
        Your current assigned task is: "${task}"

        Execute the task now, providing a concise and direct answer.
    `;

    if (selectedProvider !== 'Google Gemini') {
        // Fallback for non-Gemini providers that don't support grounding in the same way.
        // This will just be a standard non-grounded response.
        const responseStream = generateAgentThoughtStream(agent, task, objective, modelName, selectedProvider, vaultValues);
        let combinedText = '';
        for await (const chunk of responseStream) {
            combinedText += chunk;
        }
        // Mock the GenerateContentResponse structure
        return {
            text: combinedText,
            candidates: [], // No grounding info available
        } as unknown as GenerateContentResponse;
    }

    try {
        const response = await geminiAi.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                temperature: 0.2,
            },
        });
        return response;
    } catch (error) {
        console.error(`Error executing grounded task with ${selectedProvider}:`, error);
        throw new Error(`Failed to execute grounded task with ${selectedProvider}. Please check your API key and network connection.`);
    }
};

export const getOrchestratorChatResponse = async (
    chatHistory: ChatMessage[],
    orchestrator: OrchestratorManifest,
    team: AgentTeamManifest,
    teamAgents: AgentManifest[],
    modelName: string,
    selectedProvider: string,
    vaultValues: Record<string, string>
): Promise<string> => {
    const teamCapabilities = teamAgents.map(agent =>
        `- Agent: ${agent.name}\n  Description: ${agent.description}`
    ).join('\n');

    const systemPrompt = `
        You are ${orchestrator.name}, an AI mission orchestrator.
        Your Doctrine: ${orchestrator.teamDoctrine}
        You are currently managing the "${team.name}" team.
        Team Description: ${team.description}
        Available Team Members:
        ${teamCapabilities}

        Your role is to have a helpful, professional conversation with the user to help them plan missions. Answer their questions about the team's capabilities and help them refine their objectives. Be concise and conversational. Do not generate a JSON mission plan unless explicitly asked.
    `.trim();

    try {
        if (selectedProvider === 'Google Gemini') {
            const contents = chatHistory.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const response = await geminiAi.models.generateContent({
                model: modelName,
                contents: contents,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.7,
                },
            });
            return response.text.trim();
        } else {
            const apiKey = vaultValues['OPENROUTER_API_KEY'];
            if (!apiKey) {
                throw new Error("OpenRouter API key is missing from the Secure Vault.");
            }

            const messages = [
                { role: "system", content: systemPrompt },
                ...chatHistory.map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    content: m.text
                }))
            ];
            
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: messages,
                    temperature: 0.7,
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`OpenRouter API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        }
    } catch (error) {
        console.error(`Error in getOrchestratorChatResponse with ${selectedProvider}:`, error);
        throw new Error(`Failed to get a response from the orchestrator AI (${selectedProvider}).`);
    }
};