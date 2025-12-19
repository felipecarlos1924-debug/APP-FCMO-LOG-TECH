import { GoogleGenAI } from "@google/genai";
import { Vehicle, FuelLog, MaintenanceOrder } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatContext = (vehicles: Vehicle[], fuelLogs: FuelLog[], maintenance: MaintenanceOrder[]) => {
  return JSON.stringify({
    veiculos: vehicles.map(v => ({ modelo: v.model, placa: v.plate, status: v.status, km: v.mileage, motorista: v.driver })),
    combustivel_recente: fuelLogs.slice(0, 10),
    manutencoes_recentes: maintenance.slice(0, 10)
  });
};

export const generateFleetAnalysis = async (
  vehicles: Vehicle[],
  fuelLogs: FuelLog[],
  maintenance: MaintenanceOrder[]
): Promise<string> => {
  const prompt = `
    Atue como Analista de Frotas Sênior. Analise estes dados:
    ${formatContext(vehicles, fuelLogs, maintenance)}
    
    Gere um relatório curto (markdown) com: 1. Anomalias de consumo, 2. Sugestões de manutenção, 3. Oportunidades de economia. Foco em redução de custos (R$).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Sem resposta da análise.";
  } catch (error) {
    console.error("Erro AI:", error);
    return "Erro ao processar análise da frota.";
  }
};

export const askFleetAssistant = async (
  question: string,
  vehicles: Vehicle[],
  fuelLogs: FuelLog[],
  maintenance: MaintenanceOrder[]
): Promise<string> => {
  const context = formatContext(vehicles, fuelLogs, maintenance);

  const prompt = `
    Você é o assistente virtual inteligente da FCMO LOG TECH.
    Você tem acesso aos seguintes dados da frota em tempo real:
    ${context}

    O usuário perguntou: "${question}"

    Responda de forma direta, profissional e baseada nos dados. Se não houver dados sobre algo, informe.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Não entendi a pergunta.";
  } catch (error) {
    return "Erro ao processar pergunta via IA.";
  }
};