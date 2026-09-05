import { Component, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonSeverity } from 'primeng/types/button';
import { DividerModule } from "primeng/divider";
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

interface ErrorConfig {
  code: number;
  mainIcon: string;
  codeDescription: string;
  badge: {
    icon: string;
    backgroundClass: string;
    textClass: string;
  }
  title: string;
  description: string;
  message: {
    severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast' | undefined | null;
    title: string;
    description: string;
  }
  buttons: {
    label: string;
    icon: string;
    severity: ButtonSeverity;
    route?: string;
    command?: () => void;
  }[]
}

const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  '403': {
    code: 403,
    mainIcon: 'pi pi-shield',
    codeDescription: 'Acesso negado',
    badge: {
      icon: 'pi pi-lock',
      backgroundClass: 'bg-yellow-50',
      textClass: 'text-yellow-600'
    },
    title: 'Você não tem permissão para acessar este recurso',
    description: 'Seu perfil de acesso não possui as permissões necessárias para visualizar este recurso. Caso acredite que deveria ter acesso, entre em contato com o administrador do sistema para solicitar as devidas permissões.',
    message: {
      severity: 'warn',
      title: '403 Acesso negado',
      description: 'Acesso bloqueado por política de segurança. Sua sessão está ativa, mas sem privilégios suficientes.'
    },
    buttons: [
      {
        label: 'Ir para página inicial',
        icon: 'pi pi-home',
        route: '/',
        severity: 'primary'
      }
    ]
  },
  '404': {
    code: 404,
    mainIcon: 'pi pi-search',
    codeDescription: 'Não encontrado',
    badge: {
      icon: 'pi pi-map',
      backgroundClass: 'bg-blue-50',
      textClass: 'text-blue-600'
    },
    title: 'Recurso não encontrado',
    description: 'O recurso ou página que você está tentando acessar não existe ou foi movido para outro endereço. Verifique se a URL digitada está correta ou utilize os botões abaixo para retornar a uma área válida do sistema.',
    message: {
      severity: 'info',
      title: '404 Não encontrado',
      description: 'O recurso solicitado não foi encontrado no servidor.'
    },
    buttons: [
      {
        label: 'Ir para página inicial',
        icon: 'pi pi-home',
        route: '/',
        severity: 'primary'
      },
      {
        label: 'Voltar',
        icon: 'pi pi-arrow-left',
        command: () => window.history.back(),
        severity: 'secondary'
      }
    ]
  },
  '500': {
    code: 500,
    mainIcon: 'pi pi-server',
    codeDescription: 'Erro interno do servidor',
    badge: {
      icon: 'pi pi-globe',
      backgroundClass: 'bg-red-50',
      textClass: 'text-red-600'
    },
    title: 'Algo deu errado no servidor',
    description: 'Ocorreu um erro inesperado ao processar a sua requisição. Isso pode ser causado por uma falha temporária no servidor, problema de conexão ou manutenção do sistema. Aguarde alguns instantes e tente novamente. Se o problema persistir, entre em contato com o suporte técnico.',
    message: {
      severity: 'error',
      title: '500 Erro interno do servidor',
      description: 'Falha interna no processamento da requisição.'
    },
    buttons: [
      {
        label: 'Ir para página inicial',
        icon: 'pi pi-home',
        route: '/',
        severity: 'primary'
      },
      {
        label: 'Voltar',
        icon: 'pi pi-arrow-left',
        command: () => window.history.back(),
        severity: 'secondary'
      }
    ]
  },
  '502': {
    code: 502,
    mainIcon: 'pi pi-cloud',
    codeDescription: 'Erro no servidor intermediário',
    badge: {
      icon: 'pi pi-globe',
      backgroundClass: 'bg-red-50',
      textClass: 'text-red-600'
    },
    title: 'Algo deu errado no servidor intermediário',
    description: 'Ocorreu um erro inesperado ao processar a sua requisição. Isso pode ser causado por uma falha temporária no servidor, problema de conexão ou manutenção do sistema. Aguarde alguns instantes e tente novamente. Se o problema persistir, entre em contato com o suporte técnico.',
    message: {
      severity: 'error',
      title: '502 Erro no servidor intermediário',
      description: 'Resposta inválida recebida de um servidor intermediário.'
    },
    buttons: [
      {
        label: 'Ir para página inicial',
        icon: 'pi pi-home',
        route: '/',
        severity: 'primary'
      },
      {
        label: 'Voltar',
        icon: 'pi pi-arrow-left',
        command: () => window.history.back(),
        severity: 'secondary'
      }
    ]
  },
  '503': {
    code: 503,
    mainIcon: 'pi pi-clock',
    codeDescription: 'Serviço indisponível',
    badge: {
      icon: 'pi pi-globe',
      backgroundClass: 'surface-50',
      textClass: 'text-600'
    },
    title: 'O serviço está temporariamente indisponível',
    description: 'Ocorreu um erro inesperado ao processar a sua requisição. Isso pode ser causado por uma falha temporária no servidor, problema de conexão ou manutenção do sistema. Aguarde alguns instantes e tente novamente. Se o problema persistir, entre em contato com o suporte técnico.',
    message: {
      severity: 'secondary',
      title: '503 Serviço indisponível',
      description: 'Serviço temporariamente indisponível ou em manutenção.'
    },
    buttons: [
      {
        label: 'Ir para página de login',
        icon: 'pi pi-sign-in',
        route: '/security/auth/login',
        severity: 'primary'
      },
      {
        label: 'Voltar',
        icon: 'pi pi-arrow-left',
        command: () => window.history.back(),
        severity: 'secondary'
      }
    ]
  }
};

@Component({
  selector: 'app-error',
  imports: [
    DividerModule,
    MessageModule,
    ButtonModule,
    RouterLink
  ],
  templateUrl: './error.page.html',
  styleUrl: './error.page.scss',
})
export class ErrorPage {
  config: WritableSignal<ErrorConfig> = signal<ErrorConfig>(ERROR_CONFIGS['500']);

  constructor(private activatedRoute: ActivatedRoute) {
    const code: string = this.activatedRoute.snapshot.paramMap.get('code') ?? '500';
    this.config.set(ERROR_CONFIGS[code]);
  }
}
