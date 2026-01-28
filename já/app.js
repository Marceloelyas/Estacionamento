class ParkingSystem {
    constructor() {
        this.parkingSpots = [];
        this.clients = [];
        this.activities = [];
        this.settings = this.loadSettings();
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDateTime();
        this.renderDashboard();
        setInterval(() => this.updateDateTime(), 1000);
    }

    loadSettings() {
        const defaultSettings = {
            totalSpots: 40,
            pcdSpots: 4,
            prices: {
                firstHour: 15.00,
                additionalHour: 10.00,
                daily: 80.00
            }
        };
        
        const savedSettings = localStorage.getItem('parkingSettings');
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('parkingSettings', JSON.stringify(this.settings));
    }

    loadData() {
        // Carrega dados do localStorage
        const savedSpots = localStorage.getItem('parkingSpots');
        const savedClients = localStorage.getItem('parkingClients');
        const savedActivities = localStorage.getItem('parkingActivities');

        this.parkingSpots = savedSpots ? JSON.parse(savedSpots) : this.generateParkingSpots();
        this.clients = savedClients ? JSON.parse(savedClients) : [];
        this.activities = savedActivities ? JSON.parse(savedActivities) : this.generateSampleActivities();
    }

    saveData() {
        localStorage.setItem('parkingSpots', JSON.stringify(this.parkingSpots));
        localStorage.setItem('parkingClients', JSON.stringify(this.clients));
        localStorage.setItem('parkingActivities', JSON.stringify(this.activities));
    }

    generateParkingSpots() {
        const spots = [];
        const totalSpots = this.settings.totalSpots || 40;
        const pcdSpots = this.settings.pcdSpots || 4;
        
        for (let i = 1; i <= totalSpots; i++) {
            spots.push({
                id: i,
                number: i,
                status: 'available',
                type: i <= pcdSpots ? 'pcd' : 'regular',
                vehicle: null,
                entryTime: null,
                client: null
            });
        }
        
        return spots;
    }

    generateSampleActivities() {
        const now = new Date();
        return [
            {
                id: 1,
                type: 'entry',
                title: 'Veículo entrou',
                description: 'Honda Civic - ABC-1234',
                time: new Date(now.getTime() - 300000),
                spot: 12
            },
            {
                id: 2,
                type: 'payment',
                title: 'Pagamento realizado',
                description: 'Vaga 8 - R$ 25,00',
                time: new Date(now.getTime() - 600000),
                spot: 8
            },
            {
                id: 3,
                type: 'exit',
                title: 'Veículo saiu',
                description: 'Toyota Corolla - XYZ-5678',
                time: new Date(now.getTime() - 900000),
                spot: 5
            },
            {
                id: 4,
                type: 'entry',
                title: 'Veículo entrou',
                description: 'Ford Fiesta - DEF-9012',
                time: new Date(now.getTime() - 1200000),
                spot: 15
            }
        ];
    }

    setupEventListeners() {
        // Navegação do menu
        document.getElementById('dashboard-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchPage('dashboard');
        });

        document.getElementById('estacionamento-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchPage('estacionamento');
        });

        document.getElementById('clientes-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchPage('clientes');
        });

        document.getElementById('relatorios-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchPage('relatorios');
        });

        document.getElementById('configuracoes-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchPage('configuracoes');
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            if (confirm('Deseja realmente sair do sistema?')) {
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'login.html';
            }
        });
  // Notificações
        document.getElementById('notification-btn').addEventListener('click', () => {
            this.showNotifications();
        });

        // Botões principais
        document.getElementById('add-vehicle-btn')?.addEventListener('click', () => {
            this.showVehicleModal();
        });

        document.getElementById('add-client-btn')?.addEventListener('click', () => {
            this.showClientModal();
        });

        // Modal de veículo
        document.getElementById('close-vehicle-modal')?.addEventListener('click', () => {
            this.hideVehicleModal();
        });

        document.getElementById('cancel-vehicle-btn')?.addEventListener('click', () => {
            this.hideVehicleModal();
        });

        document.getElementById('vehicle-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerVehicle();
        });

        // Configurações
        document.getElementById('save-prices-btn')?.addEventListener('click', () => {
            this.savePriceSettings();
        });

        document.getElementById('save-spots-btn')?.addEventListener('click', () => {
            this.saveSpotSettings();
        });

        document.getElementById('backup-btn')?.addEventListener('click', () => {
            this.createBackup();
        });

        document.getElementById('clear-data-btn')?.addEventListener('click', () => {
            this.clearData();
        });
    }

    switchPage(page) {
        // Atualiza menu ativo
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        const pageMap = {
            'dashboard': 'dashboard-link',
            'estacionamento': 'estacionamento-link',
            'clientes': 'clientes-link',
            'relatorios': 'relatorios-link',
            'configuracoes': 'configuracoes-link'
        };

        if (pageMap[page]) {
            document.getElementById(pageMap[page]).classList.add('active');
        }

        // Oculta todas as páginas e mostra a atual
        document.querySelectorAll('.page-content').forEach(content => {
            content.classList.add('hidden');
        });

        document.getElementById(`${page}-content`).classList.remove('hidden');

        // Atualiza título da página
        const titles = {
            'dashboard': { title: 'Dashboard', subtitle: 'Visão geral do sistema' },
            'estacionamento': { title: 'Estacionamento', subtitle: 'Gerenciamento de vagas' },
            'clientes': { title: 'Clientes', subtitle: 'Cadastro e histórico' },
            'relatorios': { title: 'Relatórios', subtitle: 'Análise de dados' },
            'configuracoes': { title: 'Configurações', subtitle: 'Configurações do sistema' }
        };

        if (titles[page]) {
            document.getElementById('page-title').textContent = titles[page].title;
            document.getElementById('page-subtitle').textContent = titles[page].subtitle;
        }

        this.currentPage = page;

        // Renderiza conteúdo específico da página
        switch(page) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'estacionamento':
                this.renderParking();
                break;
            case 'clientes':
                this.renderClients();
                break;
            case 'configuracoes':
                this.renderSettings();
                break;
        }
    }

    updateDateTime() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const timeStr = now.toLocaleTimeString('pt-BR');
        
        document.getElementById('current-date').textContent = dateStr;
        document.getElementById('current-time').textContent = timeStr;
    }

    renderDashboard() {
        // Atualiza estatísticas
        const occupiedSpots = this.parkingSpots.filter(spot => spot.status === 'occupied').length;
        const availableSpots = this.parkingSpots.filter(spot => spot.status === 'available').length;
        
        document.getElementById('occupied-spots').textContent = occupiedSpots;
        document.getElementById('available-spots').textContent = availableSpots;
        
        // Calcula faturamento estimado
        let dailyRevenue = 0;
        this.parkingSpots.forEach(spot => {
            if (spot.status === 'occupied' && spot.entryTime) {
                const entryTime = new Date(spot.entryTime);
                const hours = (new Date() - entryTime) / (1000 * 60 * 60);
                const price = hours <= 1 ? this.settings.prices.firstHour : 
                            this.settings.prices.firstHour + (Math.ceil(hours) - 1) * this.settings.prices.additionalHour;
                dailyRevenue += Math.min(price, this.settings.prices.daily);
            }
        });
        
        document.getElementById('daily-revenue').textContent = 
            `R$ ${dailyRevenue.toFixed(2).replace('.', ',')}`;
        
        // Calcula tempo médio
        const occupied = this.parkingSpots.filter(spot => spot.status === 'occupied' && spot.entryTime);
        if (occupied.length > 0) {
            const avgHours = occupied.reduce((sum, spot) => {
                const entryTime = new Date(spot.entryTime);
                return sum + (new Date() - entryTime) / (1000 * 60 * 60);
            }, 0) / occupied.length;
            
            const hours = Math.floor(avgHours);
            const minutes = Math.floor((avgHours - hours) * 60);
            document.getElementById('average-time').textContent = `${hours}h ${minutes}m`;
        }
        
        // Renderiza atividades
        this.renderActivities();
        
        // Inicializa gráficos (serão completados em charts.js)
        if (typeof initCharts === 'function') {
            initCharts(this.parkingSpots, this.activities);
        }
    }

    renderActivities() {
        const activitiesList = document.getElementById('activities-list');
        if (!activitiesList) return;
        
        activitiesList.innerHTML = '';
        
        // Ordena atividades por data (mais recentes primeiro)
        const sortedActivities = [...this.activities].sort((a, b) => 
            new Date(b.time) - new Date(a.time)
        ).slice(0, 10); // Mostra apenas as 10 mais recentes
        
        sortedActivities.forEach(activity => {
            const activityDate = new Date(activity.time);
            const timeStr = activityDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const iconClass = {
                'entry': 'fas fa-sign-in-alt entry',
                'exit': 'fas fa-sign-out-alt exit',
                'payment': 'fas fa-money-bill-wave payment'
            }[activity.type] || 'fas fa-info-circle';
            
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <div class="activity-icon ${activity.type}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${timeStr}</div>
                </div>
            `;
            
            activitiesList.appendChild(activityElement);
        });
    }

renderParking() {
        const parkingGrid = document.getElementById('parking-grid');
        if (!parkingGrid) return;
        
        parkingGrid.innerHTML = '';
        
        this.parkingSpots.forEach(spot => {
            const spotElement = document.createElement('div');
            spotElement.className = `parking-spot ${spot.status} ${spot.type}`;
            spotElement.innerHTML = `
                <div class="spot-number">${spot.number}</div>
                <div class="spot-status">${this.getStatusText(spot.status)}</div>
                ${spot.type === 'pcd' ? '<div class="spot-pcd">PCD</div>' : ''}
                ${spot.vehicle ? `
                    <div class="vehicle-info">
                        <p><strong>${spot.vehicle.plate}</strong></p>
                        <p>${spot.vehicle.model}</p>
                        ${spot.client ? `<p>${spot.client.name}</p>` : ''}
                        ${spot.entryTime ? `<p>${this.getElapsedTime(spot.entryTime)}</p>` : ''}
                    </div>
                ` : ''}
                ${spot.status === 'occupied' ? `
                    <button class="btn-secondary release-btn" data-spot="${spot.id}">
                        <i class="fas fa-sign-out-alt"></i> Liberar
                    </button>
                ` : `
                    <button class="btn-primary occupy-btn" data-spot="${spot.id}">
                        <i class="fas fa-car"></i> Ocupar
                    </button>
                `}
            `;
            
            parkingGrid.appendChild(spotElement);
        });
        
        // Adiciona eventos aos botões
        document.querySelectorAll('.release-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const spotId = parseInt(e.target.closest('.release-btn').dataset.spot);
                this.releaseSpot(spotId);
            });
        });
        
        document.querySelectorAll('.occupy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const spotId = parseInt(e.target.closest('.occupy-btn').dataset.spot);
                this.showVehicleModal(spotId);
            });
        });
    }

    renderClients() {
        const tableBody = document.getElementById('clients-table-body');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        this.clients.forEach(client => {
            const clientRow = document.createElement('tr');
            clientRow.innerHTML = `
                <td>${client.name}</td>
                <td>${client.phone}</td>
                <td>${client.vehicle?.plate || '-'}</td>
                <td>${client.vehicle?.model || '-'}</td>
                <td><span class="badge badge-success">Ativo</span></td>
                <td>
                    <button class="btn-icon edit-client" data-id="${client.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-client" data-id="${client.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(clientRow);
        });
        
        // Adiciona eventos aos botões
        document.querySelectorAll('.edit-client').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clientId = e.target.closest('.edit-client').dataset.id;
                this.editClient(clientId);
            });
        });
        
        document.querySelectorAll('.delete-client').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clientId = e.target.closest('.delete-client').dataset.id;
                this.deleteClient(clientId);
            });
        });
    }

    renderSettings() {
        // Preenche formulário de preços
        document.getElementById('first-hour-price').value = this.settings.prices.firstHour;
        document.getElementById('additional-hour-price').value = this.settings.prices.additionalHour;
        document.getElementById('daily-price').value = this.settings.prices.daily;
        
        // Preenche formulário de vagas
        document.getElementById('total-spots').value = this.settings.totalSpots;
        document.getElementById('pcd-spots').value = this.settings.pcdSpots;
    }

    getStatusText(status) {
        const statusMap = {
            'available': 'Disponível',
            'occupied': 'Ocupada',
            'reserved': 'Reservada'
        };
        return statusMap[status] || status;
    }

    getElapsedTime(entryTime) {
        const entry = new Date(entryTime);
        const now = new Date();
        const diffMs = now - entry;
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    showVehicleModal(spotId = null) {
        const modal = document.getElementById('vehicle-modal');
        const form = document.getElementById('vehicle-form');
        const spotSelect = document.getElementById('spot-number');
        
        // Limpa formulário
        form.reset();
        
   // Preenche seletor de vagas
        spotSelect.innerHTML = '';
        
        this.parkingSpots
            .filter(spot => spot.status === 'available')
            .forEach(spot => {
                const option = document.createElement('option');
                option.value = spot.id;
                option.textContent = `Vaga ${spot.number} ${spot.type === 'pcd' ? '(PCD)' : ''}`;
                if (spotId === spot.id) {
                    option.selected = true;
                }
                spotSelect.appendChild(option);
            });
        
        modal.classList.remove('hidden');
    }

    hideVehicleModal() {
        document.getElementById('vehicle-modal').classList.add('hidden');
    }

    registerVehicle() {
        const plate = document.getElementById('vehicle-plate').value.trim().toUpperCase();
        const model = document.getElementById('vehicle-model').value.trim();
        const color = document.getElementById('vehicle-color').value.trim();
        const clientName = document.getElementById('client-name').value.trim();
        const clientPhone = document.getElementById('client-phone').value.trim();
        const spotId = parseInt(document.getElementById('spot-number').value);
        
        // Validações básicas
        if (!plate || !model || !clientName || !clientPhone) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Encontra a vaga
        const spot = this.parkingSpots.find(s => s.id === spotId);
        if (!spot || spot.status !== 'available') {
            alert('Esta vaga não está disponível.');
            return;
        }
        
        // Cria cliente
        const newClient = {
            id: Date.now(),
            name: clientName,
            phone: clientPhone,
            vehicle: {
                plate: plate,
                model: model,
                color: color
            },
            createdAt: new Date().toISOString()
        };
        
        // Atualiza vaga
        spot.status = 'occupied';
        spot.vehicle = {
            plate: plate,
            model: model,
            color: color
        };
        spot.client = {
            id: newClient.id,
            name: clientName
        };
        spot.entryTime = new Date().toISOString();
        
        // Adiciona cliente à lista
        this.clients.push(newClient);
        
        // Registra atividade
        this.activities.push({
            id: Date.now(),
            type: 'entry',
            title: 'Veículo entrou',
            description: `${model} - ${plate}`,
            time: new Date().toISOString(),
            spot: spot.number
        });
        
        // Salva dados
        this.saveData();
        
        // Atualiza interface
        this.hideVehicleModal();
        
        if (this.currentPage === 'estacionamento') {
            this.renderParking();
        }
        
        this.renderDashboard();
        
        alert('Veículo registrado com sucesso!');
    }

    releaseSpot(spotId) {
        const spot = this.parkingSpots.find(s => s.id === spotId);
        if (!spot || spot.status !== 'occupied') return;
        
        // Calcula valor
        const entryTime = new Date(spot.entryTime);
        const hours = (new Date() - entryTime) / (1000 * 60 * 60);
        let price = 0;
        
        if (hours <= 1) {
            price = this.settings.prices.firstHour;
        } else if (hours > 24) {
            price = this.settings.prices.daily;
        } else {
            price = this.settings.prices.firstHour + (Math.ceil(hours) - 1) * this.settings.prices.additionalHour;
            price = Math.min(price, this.settings.prices.daily);
        }
        
        if (confirm(`Liberar vaga ${spot.number}?\nTempo: ${this.getElapsedTime(spot.entryTime)}\nValor: R$ ${price.toFixed(2)}`)) {
            // Registra atividade
            this.activities.push({
                id: Date.now(),
                type: 'exit',
                title: 'Veículo saiu',
                description: `${spot.vehicle.model} - ${spot.vehicle.plate}`,
                time: new Date().toISOString(),
                spot: spot.number
            });
            
  // Registra pagamento
            this.activities.push({
                id: Date.now() + 1,
                type: 'payment',
                title: 'Pagamento realizado',
                description: `Vaga ${spot.number} - R$ ${price.toFixed(2)}`,
                time: new Date().toISOString(),
                spot: spot.number
            });
            
            // Libera vaga
            spot.status = 'available';
            spot.vehicle = null;
            spot.client = null;
            spot.entryTime = null;
            
            // Salva dados
            this.saveData();
            
            // Atualiza interface
            if (this.currentPage === 'estacionamento') {
                this.renderParking();
            }
            
            this.renderDashboard();
            
            alert(`Vaga ${spot.number} liberada com sucesso!\nValor cobrado: R$ ${price.toFixed(2)}`);
        }
    }

    savePriceSettings() {
        this.settings.prices.firstHour = parseFloat(document.getElementById('first-hour-price').value);
        this.settings.prices.additionalHour = parseFloat(document.getElementById('additional-hour-price').value);
        this.settings.prices.daily = parseFloat(document.getElementById('daily-price').value);
        
        this.saveSettings();
        alert('Preços atualizados com sucesso!');
    }

    saveSpotSettings() {
        const totalSpots = parseInt(document.getElementById('total-spots').value);
        const pcdSpots = parseInt(document.getElementById('pcd-spots').value);
        
        if (pcdSpots > totalSpots) {
            alert('O número de vagas PCD não pode ser maior que o total de vagas.');
            return;
        }
        
        this.settings.totalSpots = totalSpots;
        this.settings.pcdSpots = pcdSpots;
        
        // Regenera vagas
        this.parkingSpots = this.generateParkingSpots();
        
        this.saveSettings();
        this.saveData();
        
        if (this.currentPage === 'estacionamento') {
            this.renderParking();
        }
        
        alert('Configurações de vagas atualizadas com sucesso!');
    }

    createBackup() {
        const backup = {
            spots: this.parkingSpots,
            clients: this.clients,
            activities: this.activities,
            settings: this.settings,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-rio-park-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Backup criado com sucesso!');
    }

    clearData() {
        if (confirm('ATENÇÃO: Esta ação irá apagar todos os dados do sistema. Tem certeza?')) {
            localStorage.clear();
            alert('Todos os dados foram apagados. A página será recarregada.');
            location.reload();
        }
    }

    showNotifications() {
        // Implementação básica de notificações
        const unreadActivities = this.activities.slice(-3); // Últimas 3 atividades
        let notificationText = 'Atividades recentes:\n\n';
        
        unreadActivities.forEach(activity => {
            const time = new Date(activity.time).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            notificationText += `${time} - ${activity.title}\n`;
        });
        
        alert(notificationText);
    }
}

// Inicializa o sistema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.parkingSystem = new ParkingSystem();
});