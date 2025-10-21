
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { ThreatAlert, ThreatActorProfile } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is provided.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

let chat: Chat | null = null;

const initializeChat = () => {
    if (!chat && API_KEY) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are a helpful and knowledgeable AI SOC Assistant named Cyber-Aid. Your purpose is to assist cybersecurity analysts. Provide concise, expert-level answers to their questions about threats, vulnerabilities, tools, and best practices. Use Markdown for formatting when it improves clarity (e.g., lists, bolding)."
            }
        });
    }
}

export const generateThreatSummary = async (alert: ThreatAlert): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`**Analysis Skipped: API Key Not Provided**

This is a placeholder for the AI-generated analysis. In a configured environment, Gemini would provide an in-depth summary here.

**Potential Causes:**
*   Misconfigured firewall rule.
*   Zero-day vulnerability exploit.
*   Compromised user credentials.

**Recommended Actions:**
1.  **Isolate:** Immediately quarantine the affected system from the network.
2.  **Investigate:** Analyze logs from the source IP and the target system around the time of the alert.
3.  **Remediate:** Patch vulnerabilities, update firewall rules, and reset any compromised credentials.
4.  **Monitor:** Increase monitoring on the affected system and source IP range.`);
  }

  const prompt = `
    Analyze the following cybersecurity threat alert and provide a concise, expert-level summary for a security analyst.

    **Alert Details:**
    - **Threat Type:** ${alert.type}
    - **Source IP:** ${alert.ip}
    - **Location:** ${alert.location}
    - **Severity:** ${alert.severity}
    - **Description:** ${alert.description}
    - **Timestamp:** ${alert.timestamp}

    **Your response should be in Markdown format and include three sections:**
    1.  **Threat Summary:** A brief, clear explanation of what this alert means.
    2.  **Potential Causes:** A bulleted list of likely root causes for this type of threat.
    3.  **Recommended Actions:** A numbered list of immediate, actionable steps the analyst should take to mitigate and investigate the threat.
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating threat summary:", error);
    return "Error: Could not generate AI summary. The model may be unavailable or the API key may be invalid.";
  }
};

export const getChatbotResponse = async (message: string): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve("AI Assistant is offline: API Key not provided.");
    }

    initializeChat();
    
    if (!chat) {
        return Promise.resolve("Error: Could not initialize AI Assistant.");
    }

    try {
        const response: GenerateContentResponse = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error getting chatbot response:", error);
        return "Error: Could not get a response from the AI assistant. Please try again later.";
    }
};

const threatActorProfileSchema = {
    type: Type.OBJECT,
    properties: {
        threatActorGroup: {
            type: Type.STRING,
            description: "The name of the most likely threat actor group (e.g., APT29, FIN7, Lazarus Group). If unknown, state 'Unknown'."
        },
        confidence: {
            type: Type.NUMBER,
            description: "A confidence score from 0.0 to 1.0 representing the certainty of the attribution."
        },
        motivation: {
            type: Type.STRING,
            description: "The primary motivation of this group (e.g., Espionage, Financial Gain, Hacktivism, Sabotage)."
        },
        mitreTTPs: {
            type: Type.ARRAY,
            description: "A list of 2-4 relevant MITRE ATT&CK Technique IDs (e.g., T1566.001, T1059.001) associated with this activity.",
            items: { type: Type.STRING }
        }
    },
    required: ["threatActorGroup", "confidence", "motivation", "mitreTTPs"]
};

export const getThreatAttribution = async (alert: ThreatAlert): Promise<ThreatActorProfile | null> => {
    if (!API_KEY) {
        return Promise.resolve(null);
    }

    const prompt = `
        Act as a Threat Attribution Engine. Based on the provided cybersecurity alert data, attribute the activity to a known threat actor group.
        
        **Alert Data:**
        - **Threat Type:** ${alert.type}
        - **Source IP Location:** ${alert.location}
        - **Target Service:** ${alert.details.targetService}
        - **Payload Signature:** ${alert.details.payloadSignature}
        
        Analyze the combination of these factors, especially the payload signature and target service, to infer the most likely threat actor.
        Provide your analysis in the specified JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: threatActorProfileSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ThreatActorProfile;

    } catch (error) {
        console.error("Error getting threat attribution:", error);
        return null;
    }
};
