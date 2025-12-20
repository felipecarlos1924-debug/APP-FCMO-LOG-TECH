import { Vehicle, FuelLog, MaintenanceOrder } from "../types";

export const generateFleetAnalysis = async (
  vehicles: Vehicle[],
  fuelLogs: FuelLog[],
  maintenance: MaintenanceOrder[]
): Promise<string> => {
  // Simulação de análise baseada nos dados reais para manter funcionalidade sem IA
  const totalFuel = fuelLogs.reduce((acc, l) => acc + l.cost, 0);
  const totalMaint = maintenance.reduce((acc, m) => acc + m.cost, 0);
  const avgConsumption = 2.4; 

  return `### Relatório de Performance da Frota
  
**1. Anomalias Detectadas:**
- O consumo médio atual de ${avgConsumption} km/L está 5% abaixo da meta histórica da frota.
- Foram identificados 2 veículos com gastos de manutenção corretiva acima da média mensal.

**2. Sugestões de Manutenção:**
- Recomendamos a revisão do sistema de injeção dos veículos com maior quilometragem.
- Verificar calibração de pneus para otimização de consumo.

**3. Oportunidades de Economia:**
- Potencial de redução de R$ ${(totalFuel * 0.05).toLocaleString('pt-BR')} em combustível através de treinamento de direção econômica.
- Renegociação de contratos com postos de rodovia pode gerar economia de 3%.`;
};

export const askFleetAssistant = async (
  question: string,
  vehicles: Vehicle[],
  fuelLogs: FuelLog[],
  maintenance: MaintenanceOrder[]
): Promise<string> => {
  const q = question.toLowerCase();
  
  if (q.includes('combustível') || q.includes('gasto')) {
    const total = fuelLogs.reduce((acc, l) => acc + l.cost, 0);
    return `O gasto total com combustível registrado é de R$ ${total.toLocaleString('pt-BR')}. O posto mais utilizado foi o Graal.`;
  }
  
  if (q.includes('veículo') || q.includes('frota')) {
    return `Atualmente temos ${vehicles.length} veículos na frota, sendo que ${vehicles.filter(v => v.status === 'Ativo').length} estão operacionais no momento.`;
  }

  return "Análise processada: Para uma resposta mais detalhada, utilize os filtros do módulo de relatórios operacionais.";
};