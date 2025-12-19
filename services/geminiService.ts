
import { GoogleGenAI } from "@google/genai";
import { Vehicle, FuelLog, MaintenanceOrder } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to format data for context
const formatContext = (vehicles: Vehicle[], fuelLogs: FuelLog[], maintenance: MaintenanceOrder[]) => {
  return JSON.stringify({
    veiculos: vehicles.map(v => ({ modelo: v.model, placa: v.plate, status: v.status, km: v.mileage, motorista: v.driver })),
    combustivel_recente: fuelLogs.slice(0, 10), // Limit context size
    manutencoes_recentes: maintenance.slice(0, 10)
  });
};

export const generateFleetAnalysis = async (
  vehicles: Vehicle[],
  fuelLogs: FuelLog[],
  maintenance: MaintenanceOrder[]
): Promise<string> => {
  if (!apiKey) return "A chave de API não foi configurada.";

  const prompt = `
    Atue como Analista de Frotas Sênior. Analise estes dados:
    ${formatContext(vehicles, fuelLogs, maintenance)}
    
    Gere um relatório curto (markdown) com: 1. Anomalias de consumo, 2. Sugestões de manutenção, 3. Oportunidades de economia. Foco em redução de custos (R$).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Sem resposta.";
  } catch (error) {
    console.error("Erro AI:", error);
    return "Erro de conexão com a IA.";
  }
};

export const askFleetAssistant = async (
  question: string,
  vehicles: Vehicle[],
  fuelLogs: FuelLog[],
  maintenance: MaintenanceOrder[]
): Promise<string> => {
  if (!apiKey) return "Configure a API_KEY para usar o chat.";

  const context = formatContext(vehicles, fuelLogs, maintenance);

  const prompt = `
    Você é o assistente virtual inteligente da FCMO LOG TECH.
    Você tem acesso aos seguintes dados da frota em tempo real (JSON):
    ${context}

    O usuário (Gestor da Frota) perguntou: "${question}"

    Responda de forma direta, profissional e baseada APENAS nos dados fornecidos acima. Se não souber, diga que não há dados suficientes.
    Use formatação Markdown para deixar a resposta bonita (negrito em valores, listas, etc).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Não entendi a pergunta.";
  } catch (error) {
    return "Erro ao processar pergunta.";
  }
};
