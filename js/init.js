/**
 * Arquivo de inicialização do sistema Rio Park Vallet
 * 
 * Este arquivo é responsável por:
 * 1. Verificar autenticação
 * 2. Inicializar componentes globais
 * 3. Configurar interceptadores
 * 4. Inicializar serviços
 */

class SystemInitializer {
    constructor() {
        this.currentUser = null;
        this.systemConfig = {};
        this.init();
    }

    async init() {
        console.log('Inicializando sistema Rio Park Vallet...');
        
        // Verifica autenticação
        if (!this.checkAuthentication()) {
            return;
        }
        
        // Carrega configurações
        await this.loadSystemConfig();
        
        // Inicializa serviços
        this.initServices();
        
        // Configura interceptadores
        this.setupInterceptors();
        
        // Configura eventos globais
        this.setupGlobalEvents();
        
        console.log('Sistema inicializado com sucesso!');
        console.log('Usuário:', this.currentUser);
    }

    checkAuthentication() {
        // Se estiver na página de login, não verifica autenticação
        if (window.location.pathname.includes('login.html')) {
            return false;
        }
        
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userData = localStorage.getItem('currentUser');
        
        if (!isLoggedIn || !userData) {
            console.warn('Usuário não autenticado. Redirecionando para login...');
            window.location.href = 'login.html';
            return false;
        }
        
        try {
            this.currentUser = JSON.parse(userData);
            
            // Atualiza nome do usuário na interface
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = this.currentUser.name;
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            window.location.href = 'login.html';
            return false;
        }
    }

    async loadSystemConfig() {
        try {
            // Carrega configurações do sistema
            const settings = localStorage.getItem('parkingSettings');
            this.systemConfig = settings ? JSON.parse(settings) : {};
            
            // Configurações padrão
            const defaultConfig = {
                version: '1.0.0',
                lastBackup: null,
                notifications: true,
                autoRefresh: true,
                theme: 'light'
            };
            
            // Mescla configurações
            this.systemConfig = { ...defaultConfig, ...this.systemConfig };
         
// Aplica tema
            this.applyTheme();
            
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            this.systemConfig = {};
        }
    }

    applyTheme() {
        if (this.systemConfig.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    initServices() {
        // Inicializa serviço de notificações
        this.initNotifications();
        
        // Inicializa serviço de sincronização
        this.initSyncService();
        
        // Inicializa serviço de analytics
        this.initAnalytics();
    }

    initNotifications() {
        if (!('Notification' in window)) {
            console.log('Este navegador não suporta notificações.');
            return;
        }
        
        // Solicita permissão se necessário
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Permissão para notificações concedida.');
                    this.systemConfig.notifications = true;
                    this.saveSystemConfig();
                }
            });
        }
        
        // Configura notificações periódicas
        if (this.systemConfig.notifications) {
            this.setupPeriodicNotifications();
        }
    }

    setupPeriodicNotifications() {
        // Notificação a cada hora para checar status
        setInterval(() => {
            if (document.hidden && this.systemConfig.notifications) {
                this.sendStatusNotification();
            }
        }, 3600000); // 1 hora
    }

    sendStatusNotification() {
        // Verifica se há notificações importantes
        const activities = JSON.parse(localStorage.getItem('parkingActivities') || '[]');
        const recentActivities = activities.filter(activity => {
            const activityTime = new Date(activity.time);
            const oneHourAgo = new Date(Date.now() - 3600000);
            return activityTime > oneHourAgo;
        });
        
        if (recentActivities.length > 0 && Notification.permission === 'granted') {
            new Notification('Rio Park Vallet - Atividades Recentes', {
                body: `${recentActivities.length} nova(s) atividade(s) na última hora`,
                icon: '/icons/icon-192.png'
            });
        }
    }

    initSyncService() {
        // Verifica se há dados pendentes para sincronização
        window.addEventListener('online', () => {
            this.syncPendingData();
        });
        
        // Tenta sincronizar a cada 5 minutos se online
        if (this.systemConfig.autoRefresh) {
            setInterval(() => {
                if (navigator.onLine) {
                    this.syncPendingData();
                }
            }, 300000); // 5 minutos
        }
    }

    syncPendingData() {
        // Aqui você implementaria a sincronização com um servidor
        // Por enquanto, apenas loga
        console.log('Sincronizando dados...');
        
        // Simula sincronização
        setTimeout(() => {
            console.log('Dados sincronizados com sucesso!');
        }, 1000);
    }

    initAnalytics() {
        // Configura analytics básico
        this.trackPageView();
        this.setupAnalyticsEvents();
    }

    trackPageView() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const eventData = {
            event: 'page_view',
            page: page,
            user: this.currentUser?.username,
            timestamp: new Date().toISOString()
        };
        
        this.logAnalytics(eventData);
    }

    setupAnalyticsEvents() {
        // Rastreia cliques em botões importantes
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button && button.id) {
                const eventData = {
                    event: 'button_click',
                    button_id: button.id,
                    user: this.currentUser?.username,
                    timestamp: new Date().toISOString()
                };
                this.logAnalytics(eventData);
            }
        });
        
        // Rastreia mudanças de página
        const originalPushState = history.pushState;
        history.pushState = function() {
            originalPushState.apply(this, arguments);
            window.dispatchEvent(new Event('locationchange'));
        };
        
        window.addEventListener('locationchange', () => {
            this.trackPageView();
        });
    }

    logAnalytics(eventData) {
        // Em produção, você enviaria para um servidor de analytics
        // Por enquanto, apenas armazena no localStorage
        let analyticsLog = JSON.parse(localStorage.getItem('analyticsLog') || '[]');
        analyticsLog.push(eventData);
        
        // Mantém apenas os últimos 1000 eventos
        if (analyticsLog.length > 1000) {
            analyticsLog = analyticsLog.slice(-1000);
        }
        
        localStorage.setItem('analyticsLog', JSON.stringify(analyticsLog));
    }

    setupInterceptors() {
        // Intercepta erros não tratados
        window.addEventListener('error', (event) => {
            console.error('Erro não tratado:', event.error);
            this.logError(event.error);
        });
        
        // Intercepta promessas rejeitadas não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promessa rejeitada não tratada:', event.reason);
            this.logError(event.reason);
        });
    }

    logError(error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            user: this.currentUser?.username,
            url: window.location.href
        };
        
        let errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
        errors.push(errorLog);
        localStorage.setItem('errorLog', JSON.stringify(errors));
    }

    setupGlobalEvents() {
        // Atualiza contador de notificações
        this.updateNotificationCount();
        
        // Configura atalhos de teclado
        this.setupKeyboardShortcuts();
        
        // Configura arrastar e soltar
        this.setupDragAndDrop();
    }

    updateNotificationCount() {
        const activities = JSON.parse(localStorage.getItem('parkingActivities') || '[]');
        const oneHourAgo = new Date(Date.now() - 3600000);
        const newActivities = activities.filter(a => new Date(a.time) > oneHourAgo);
        
        const notificationCount = document.querySelector('.notification-count');
        if (notificationCount) {
            notificationCount.textContent = newActivities.length > 0 ? newActivities.length : '';
            notificationCount.style.display = newActivities.length > 0 ? 'flex' : 'none';
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + D - Dashboard
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                if (window.parkingSystem) {
                    window.parkingSystem.switchPage('dashboard');
                }
            }
            
            // Alt + E - Estacionamento
            if (e.altKey && e.key === 'e') {
                e.preventDefault();
                if (window.parkingSystem) {
                    window.parkingSystem.switchPage('estacionamento');
                }
            }
            
// Alt + C - Clientes
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                if (window.parkingSystem) {
                    window.parkingSystem.switchPage('clientes');
                }
            }
            
            // Alt + L - Logout
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                if (window.parkingSystem) {
                    document.getElementById('logout-btn').click();
                }
            }
            
            // Escape - Fecha modais
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (!modal.classList.contains('hidden')) {
                        modal.classList.add('hidden');
                    }
                });
            }
        });
    }

    setupDragAndDrop() {
        // Configura arrastar e soltar para backup/restauração
        const dropZone = document.body;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.name.endsWith('.json')) {
                    this.handleBackupFile(file);
                }
            }
        });
    }

    handleBackupFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                if (confirm('Deseja restaurar este backup? Todos os dados atuais serão substituídos.')) {
                    this.restoreBackup(backupData);
                }
            } catch (error) {
                alert('Erro ao ler arquivo de backup. Certifique-se de que é um arquivo JSON válido.');
            }
        };
        reader.readAsText(file);
    }

    restoreBackup(backupData) {
        try {
            // Restaura dados
            if (backupData.spots) localStorage.setItem('parkingSpots', JSON.stringify(backupData.spots));
            if (backupData.clients) localStorage.setItem('parkingClients', JSON.stringify(backupData.clients));
            if (backupData.activities) localStorage.setItem('parkingActivities', JSON.stringify(backupData.activities));
            if (backupData.settings) localStorage.setItem('parkingSettings', JSON.stringify(backupData.settings));
            
            alert('Backup restaurado com sucesso! A página será recarregada.');
            location.reload();
        } catch (error) {
            alert('Erro ao restaurar backup: ' + error.message);
        }
    }

    saveSystemConfig() {
        localStorage.setItem('systemConfig', JSON.stringify(this.systemConfig));
    }

    // Métodos utilitários
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Inicializa o sistema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.systemInitializer = new SystemInitializer();
    
    // Adiciona classe de carregamento
    document.body.classList.add('loaded');
    
    // Remove mensagem de carregamento se houver
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.remove();
    }
});

// Adiciona estilos para estado de carregamento
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    .loading {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.3s ease;
    }
    
    .loading.hidden {
        opacity: 0;
        pointer-events: none;
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
    }
    
    .loading-text {
        margin-top: 20px;
        color: white;
        font-size: 1.2rem;
        font-weight: 500;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .drag-over {
        outline: 2px dashed #667eea;
        outline-offset: -10px;
        background: rgba(102, 126, 234, 0.05) !important;
    }
    
    [data-theme="dark"] {
        --bg-color: #1a1a2e;
        --text-color: #ffffff;
        --card-bg: #16213e;
        --border-color: #2d3748;
    }
    
    body:not(.loaded) {
        overflow: hidden;
    }
`;
document.head.appendChild(loadingStyles);