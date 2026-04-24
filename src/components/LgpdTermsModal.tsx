type Props = { onClose: () => void };

export function LgpdTermsModal({ onClose }: Props) {
  return (
    <div
      className="popup-overlay"
      onClick={onClose}
      style={{ zIndex: 10000 }}
    >
      <div
        className="popup-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 640, maxHeight: "85vh", display: "flex", flexDirection: "column" }}
      >
        <button className="popup-close" onClick={onClose} aria-label="Fechar termos">
          ✕
        </button>
        <div
          className="popup-body"
          style={{ overflowY: "auto", paddingRight: 8 }}
        >
          <h2 style={{ marginTop: 0 }}>Termo de Consentimento — Tratamento de Dados (LGPD)</h2>
          <p style={{ color: "#555", marginTop: -4 }}>
            Última atualização: 24/04/2026
          </p>

          <h3>1. Quem é o controlador dos dados</h3>
          <p>
            Os dados coletados neste formulário são tratados pela <strong>Rádio TOP100 FM</strong>,
            inscrita no CNPJ <strong>46.549.775/0001-11</strong>, na qualidade de controladora,
            nos termos da Lei nº 13.709/2018 — Lei Geral de Proteção de Dados (LGPD).
          </p>

          <h3>2. Quais dados são coletados</h3>
          <ul>
            <li>Nome completo</li>
            <li>Número de WhatsApp (com DDD)</li>
            <li>CPF</li>
            <li>Usuário de Instagram</li>
            <li>Perfil de Facebook (link ou nome)</li>
          </ul>

          <h3>3. Finalidade do tratamento</h3>
          <ul>
            <li>Validar a participação do titular na promoção;</li>
            <li>Identificar de forma única o participante (CPF) e impedir cadastros duplicados;</li>
            <li>Entrar em contato pelo WhatsApp informado em caso de premiação;</li>
            <li>Conferir o cumprimento das regras (ex.: seguir os perfis nas redes sociais).</li>
          </ul>

          <h3>4. Base legal</h3>
          <p>
            O tratamento é realizado com base no <strong>consentimento livre, informado e
            inequívoco</strong> do titular (art. 7º, I, LGPD), manifestado por meio do aceite
            deste termo, e na <strong>execução de procedimentos preliminares relacionados a
            contrato</strong> de participação na promoção (art. 7º, V).
          </p>

          <h3>5. Compartilhamento</h3>
          <p>
            Os dados não são vendidos a terceiros. Podem ser compartilhados apenas com
            prestadores de serviço estritamente necessários (ex.: provedor de banco de dados,
            agência responsável pela operação da promoção) e com autoridades competentes,
            quando exigido por lei.
          </p>

          <h3>6. Tempo de armazenamento</h3>
          <p>
            Os dados serão mantidos enquanto durar a promoção e por até 5 (cinco) anos após o
            seu encerramento, para fins de prestação de contas, prevenção a fraudes e
            atendimento a obrigações legais. Após esse prazo, os dados são eliminados ou
            anonimizados.
          </p>

          <h3>7. Direitos do titular</h3>
          <p>O titular pode, a qualquer momento, solicitar:</p>
          <ul>
            <li>Confirmação da existência de tratamento;</li>
            <li>Acesso aos seus dados;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação dos dados;</li>
            <li>Portabilidade;</li>
            <li>Revogação do consentimento e eliminação dos dados tratados com base nele.</li>
          </ul>

          <h3>8. Como exercer seus direitos / pedir exclusão</h3>
          <p>
            Para solicitar a exclusão dos seus dados, ou exercer qualquer outro direito previsto
            na LGPD, envie e‑mail para{" "}
            <a href="mailto:agenciaaxisdigital@gmail.com" style={{ color: "#0a1f44" }}>
              agenciaaxisdigital@gmail.com
            </a>{" "}
            informando o nome completo e o CPF utilizados no cadastro. Atenderemos a solicitação
            no menor prazo possível, observando os limites legais.
          </p>

          <h3>9. Segurança</h3>
          <p>
            Adotamos medidas técnicas e administrativas para proteger os dados pessoais contra
            acessos não autorizados, perda, alteração ou destruição.
          </p>

          <h3>10. Aceite</h3>
          <p>
            Ao marcar a caixa <em>"Li e aceito o tratamento dos meus dados pessoais conforme a
            LGPD"</em> e enviar o formulário, o titular declara estar ciente e de acordo com os
            termos acima.
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button
              type="button"
              onClick={onClose}
              className="popup-link"
              style={{ border: "none", cursor: "pointer" }}
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
