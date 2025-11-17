
import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import { MENU_ITEMS } from '../constants';
import { OrderItem } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const placeOrderFunctionDeclaration: FunctionDeclaration = {
  name: 'place_order',
  description: 'Places a customer\'s order with the items they have confirmed.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        description: 'An array of items to order.',
        items: {
          type: Type.OBJECT,
          properties: {
            id: {
              type: Type.STRING,
              description: 'The ID of the menu item, e.g., "coffee-001".',
            },
            quantity: {
              type: Type.INTEGER,
              description: 'The number of units for this item.',
            },
          },
          required: ['id', 'quantity'],
        }
      },
    },
    required: ['items']
  }
};


const systemInstruction = `You are a friendly and efficient chatbot for Stanley's Cafe. 
Your goal is to help customers browse the menu and place orders. 
Be conversational and helpful. Do not make up items.
When a customer is ready to order, ask them to confirm. 
Once they confirm, you MUST call the 'place_order' function with the items they specified.
Do not call the function before the user confirms the order.
Calculate the total price yourself and tell the user before asking for confirmation. Prices are final.

Here is the menu in JSON format:
${JSON.stringify(MENU_ITEMS.map(item => ({id: item.id, name: item.name, price: item.price, description: item.description})))}
`;

export interface GeminiResponse {
    text?: string;
    functionCall?: {
        name: string;
        args: {
            items: { id: string, quantity: number }[];
        };
    };
}

export const getChatbotResponse = async (userMessage: string, chatHistory: { role: string; parts: { text: string }[] }[]): Promise<GeminiResponse> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
            config: {
                systemInstruction: systemInstruction,
                tools: [{ functionDeclarations: [placeOrderFunctionDeclaration] }],
            },
        });
        
        const functionCalls = response.functionCalls;
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            return {
                functionCall: {
                    name: call.name,
                    args: call.args as { items: { id: string, quantity: number }[] },
                }
            };
        }

        const text = response.text;
        return { text };
    } catch (error) {
        console.error("Error getting response from Gemini:", error);
        return { text: "I'm sorry, I'm having a little trouble right now. Please try again later." };
    }
};

export const createOrderFromFunctionCall = (items: { id: string, quantity: number }[]): Omit<import('../types').Order, 'id' | 'timestamp' | 'status'> => {
    let total = 0;
    const orderItems: OrderItem[] = items.map(item => {
        const menuItem = MENU_ITEMS.find(mi => mi.id === item.id);
        if (!menuItem) {
            throw new Error(`Invalid menu item ID: ${item.id}`);
        }
        total += menuItem.price * item.quantity;
        return { ...menuItem, quantity: item.quantity };
    });

    return { items: orderItems, total };
};
