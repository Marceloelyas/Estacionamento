class ChartManager {
    constructor() {
        this.occupationChart = null;
        this.revenueChart = null;
    }

    initCharts(parkingSpots, activities) {
        this.renderOccupationChart(parkingSpots);
        this.renderRevenueChart(activities);
    }

    renderOccupationChart(parkingSpots) {
        const ctx = document.getElementById('occupation-chart');
        if (!ctx) return;
        
        // Destroi gráfico anterior se existir
        if (this.occupationChart) {
            this.occupationChart.destroy();
        }
        
        // Calcula dados para as últimas 24 horas
        const now = new Date();
        const hours = [];
        const occupationData = [];
        
        for (let i = 23; i >= 0; i--) {
            const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
            hours.push(hour.getHours().toString().padStart(2, '0') + ':00');
            
            // Simulação de dados - em produção, você buscaria dados históricos
            const baseOccupation = parkingSpots.filter(spot => spot.status === 'occupied').length;
            const variation = Math.sin(i * 0.5) * 5; // Variação baseada em seno
            occupationData.push(Math.max(0, Math.min(baseOccupation + variation, 40)));
        }
        
        this.occupationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Vagas Ocupadas',
                    data: occupationData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 40,
                        title: {
                            display: true,
                            text: 'Vagas Ocupadas'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Horário'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    renderRevenueChart(activities) {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;
        
        // Destroi gráfico anterior se existir
        if (this.revenueChart) {
            this.revenueChart.destroy();
        }
        
        // Calcula faturamento dos últimos 7 dias
        const days = [];
        const revenueData = [];
        const today = new Date();
        
        // Busca configurações de preços
        const settings = JSON.parse(localStorage.getItem('parkingSettings')) || {
            prices: {
                firstHour: 15.00,
                additionalHour: 10.00,
                daily: 80.00
            }
        };
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStr = date.toLocaleDateString('pt-BR', { weekday: 'short' });
            days.push(dayStr);
            
            // Calcula faturamento para o dia (simulação)
            let dailyRevenue = 0;
            
            // Filtra atividades de pagamento deste dia
            const dayActivities = activities.filter(activity => {
                if (activity.type !== 'payment') return false;
                const activityDate = new Date(activity.time);
                return activityDate.toDateString() === date.toDateString();
            });
            
            // Soma valores das atividades (extrai valor da descrição)
            dayActivities.forEach(activity => {
                const match = activity.description.match(/R\$ ([\d,]+)/);
                if (match) {
                    const value = parseFloat(match[1].replace(',', '.'));
                    dailyRevenue += value;
                }
            });
            
            // Se não houver atividades, gera dados simulados
            if (dailyRevenue === 0) {
                dailyRevenue = Math.floor(Math.random() * 1500) + 500;
            }
            
            revenueData.push(dailyRevenue);
        }
        
        this.revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Faturamento (R$)',
                    data: revenueData,
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `R$ ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valor (R$)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(0);
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Dia da Semana'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    renderParkingChart(parkingSpots) {
        const ctx = document.getElementById('parking-chart');
        if (!ctx) return;
        
        const occupied = parkingSpots.filter(spot => spot.status === 'occupied').length;
        const available = parkingSpots.filter(spot => spot.status === 'available').length;
        const reserved = parkingSpots.filter(spot => spot.status === 'reserved').length;
        
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ocupadas', 'Disponíveis', 'Reservadas'],
                datasets: [{
                    data: [occupied, available, reserved],
                    backgroundColor: [
                        '#e74c3c',
                        '#2ecc71',
                        '#f39c12'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}
// Função global para inicialização
function initCharts(parkingSpots, activities) {
    window.chartManager = new ChartManager();
    window.chartManager.initCharts(parkingSpots, activities);
}

// Atualiza gráficos quando a janela é redimensionada
window.addEventListener('resize', () => {
    if (window.chartManager && window.parkingSystem) {
        window.chartManager.initCharts(
            window.parkingSystem.parkingSpots,
            window.parkingSystem.activities
        );
    }
});