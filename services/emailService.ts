
/**
 * SERVIÇO DE E-MAIL REAL - FCMO LOG TECH
 * Configurado com as chaves reais fornecidas pelo cliente.
 */

const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_mrxl2md',
  TEMPLATE_ID: 'template_atv_fcmo', 
  PUBLIC_KEY: 'UgfmZU7SPkPXZqHzd',
};

export const sendActivationEmail = async (userName: string, userEmail: string, otpCode: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.SERVICE_ID,
        template_id: EMAILJS_CONFIG.TEMPLATE_ID,
        user_id: EMAILJS_CONFIG.PUBLIC_KEY,
        template_params: {
          // O campo 'to_email' é o padrão que o EmailJS usa para o destinatário
          to_email: userEmail, 
          user_name: userName,
          user_email: userEmail,
          otp_code: otpCode,
          
          // Compatibilidade com templates antigos
          name: userName,
          nome: userName,
          mensagem: `Seu código de ativação FCMO LOG é: ${otpCode}`,
          tempo: new Date().toLocaleString('pt-BR')
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("FCMO LOG: Erro na API EmailJS:", errorData);
      return false;
    }

    console.log(`FCMO LOG: E-mail de ativação enviado com sucesso para ${userEmail}`);
    return true;
  } catch (error) {
    console.error("FCMO LOG: Falha crítica na conexão de e-mail:", error);
    return false;
  }
};
